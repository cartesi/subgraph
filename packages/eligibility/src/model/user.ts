import { KnexDB } from "../db"
import { BigNumber, utils } from "ethers"
import { Range } from "../utils/range"
import { EtherBlocks } from "./etherBlocks"

import { ForwardIterator } from "../utils/forwardIterator"
import { EligibilityModel } from "./eligibility"
export interface UserState {
    id: string
    staked_balance: BigNumber
    maturing_balance: BigNumber
    maturing_timestamp: number
    releasing_balance?: BigNumber
    releasing_timestamp?: number
    balance?: BigNumber
    total_blocks?: number
    total_reward?: number
    pool?: string
    vid: number
    block_range: Range
}

interface UserStateRaw {
    id: string
    staked_balance: string
    maturing_balance: string
    maturing_timestamp: string
    releasing_balance?: string
    releasing_timestamp?: string
    balance?: string
    total_blocks?: string
    total_reward?: string
    pool?: string
    vid: string
    block_range: string
}

export function fromRaw(state: UserStateRaw): UserState {
    const {
        id,
        staked_balance,
        maturing_balance,
        maturing_timestamp,
        vid,
        block_range,
    } = state
    return {
        id,
        staked_balance: BigNumber.from(staked_balance),
        maturing_balance: BigNumber.from(maturing_balance),
        maturing_timestamp: parseInt(maturing_timestamp),
        vid: parseInt(vid),
        block_range: Range.fromRangeString(block_range),
    }
}

export async function loadUsersByRange(
    range: Range,
    blocks: EtherBlocks,
    blockSelectorID: string,
    db: KnexDB
): Promise<User[]> {
    console.info(
        `Loading users that interacted on that range of blocks ${range.toString()}`
    )
    const res = await db<UserStateRaw>("user")
        .select("id")
        .select("staked_balance")
        .select("maturing_balance")
        .select("maturing_timestamp")
        .select("vid")
        .select("block_range")
        .whereRaw(
            db.raw(`int4range(${range.start},${range.end}) && block_range`)
        )
        .orderBy("id")
        .orderBy("vid", "asc")
    // .limit(10)
    let users: User[] = []
    let eligibilityLoad: Promise<void>[] = []
    res.forEach((state: UserStateRaw) => {
        if (
            users.length === 0 ||
            users[users.length - 1].address !== state.id
        ) {
            let user = new User(
                state.id,
                [fromRaw(state)],
                blocks,
                range.end!,
                blockSelectorID,
                db
            )
            users.push(user)
            eligibilityLoad.push(user.eligibilityLoad())
            return
        }
        let user = users[users.length - 1]
        user.states.data.push(fromRaw(state))
    })
    await Promise.all(eligibilityLoad)
    console.info(`Successfully loaded ${users.length} users`)
    return users
}

export async function findUsers(db: KnexDB): Promise<string[]> {
    const res = await db<UserStateRaw>("user").select(db.raw("DISTINCT(id)"))
    //@todo add a query that ignores zero stake users
    console.info(`\t${res.length} users were found`)

    return res.map((user: any) => user.id)
}

export async function loadUser(
    userAddress: string,
    blocks: EtherBlocks,
    blockSelectorID: string,
    db: KnexDB
): Promise<User> {
    let latestBlock = await blocks.latestBlock()
    const res = await db<UserStateRaw>("user")
        .select("id")
        .select("staked_balance")
        .select("maturing_balance")
        .select("maturing_timestamp")
        .select("vid")
        .select("block_range")
        .where("id", userAddress)
        .orderBy("vid", "asc")

    let users: User[] = []
    res.forEach((state: UserStateRaw) => {
        if (
            users.length === 0 ||
            users[users.length - 1].address !== state.id
        ) {
            let user = new User(
                state.id,
                [fromRaw(state)],
                blocks,
                latestBlock,
                blockSelectorID,
                db
            )
            users.push(user)
            return
        }
        let user = users[users.length - 1]
        user.states.data.push(fromRaw(state))
    })
    await users[0].eligibilityLoad()
    return users[0]
}

export class User {
    address: string
    hashedAddress: string
    states: ForwardIterator
    blocks: EtherBlocks
    latestBlock: number
    eligibility: EligibilityModel
    db: KnexDB

    constructor(
        address: string,
        states: UserState[],
        blocks: EtherBlocks,
        latestBlock: number,
        blockSelectorID: string,
        db: KnexDB
    ) {
        this.address = address
        this.hashedAddress = utils.solidityKeccak256(["address"], [address])
        this.states = new ForwardIterator(states)
        this.blocks = blocks
        this.latestBlock = latestBlock
        this.db = db
        this.eligibility = new EligibilityModel(address, blockSelectorID, db)
    }

    async eligibilityLoad() {
        return this.eligibility.load()
    }

    getStakedBalance(blockNumber: number): BigNumber {
        let state = this.getValidState(blockNumber)
        let staked = state.staked_balance
        if (state.maturing_timestamp <= this.blocks.getTimeStamp(blockNumber))
            return staked.add(state.maturing_balance)
        return staked
    }

    getValidState(blockNumber: number): UserState {
        return this.states.getValidData(blockNumber) as UserState
    }

    getLowerLimitStateRange(): number {
        if (this.eligibility.last)
            return this.eligibility.last.block_range.start
        return (this.states.data[0] as UserState).block_range.start
    }

    getUpperLimitStateRange(): number {
        let end = (this.states.data[this.states.data.length - 1] as UserState)
            .block_range.end
        if (end) return Math.min(end, this.latestBlock)
        return this.latestBlock
    }
}
