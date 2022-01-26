import { BigNumber, utils } from "ethers"
import { User } from "./model/user"
import {
    BlockSelectorContext,
    BlockSelectorContextState,
} from "./model/blockSelectorContext"
import { EtherBlocks } from "./model/etherBlocks"
import { CartesiMath } from "./utils/CartesiMath"
const C_256 = 256
const DIFFICULTY_BASE_MULTIPLIER = 256000000 //256M
const ADJUSTMENT_BASE = 1000000 // 1M
const ONE_MILLION = 1000000

export class BlockSelector {
    bscState: BlockSelectorContextState
    etherBlocks: EtherBlocks
    lastLogOfRandom: {
        user: string
        goal: string
        log: number
    }

    constructor(bscState: BlockSelectorContextState, etherBlocks: EtherBlocks) {
        if (
            bscState.id.split("-")[0] !=
            "0x742fcf5ba052d9912499acf208d5410ae31d49ac"
        )
            throw new Error(
                `This Class implementation of BlockSelectorContext does not support this deployment ${bscState.id}`
            )
        this.bscState = bscState
        this.etherBlocks = etherBlocks
        this.lastLogOfRandom = {
            user: "",
            goal: "",
            log: 0,
        }
    }

    canProduceBlock(user: User, blockNumber: number): boolean {
        let bsc = this.bscState.getContext(blockNumber)
        // cannot produce if block selector goal hasn't been decided yet
        // goal is defined the block after selection was reset
        if (blockNumber <= bsc.eth_block_checkpoint) {
            return false
        }
        let weight = user.getStakedBalance(blockNumber)
        if (weight.eq(0)) return false
        let time = this.getMicrosecondsSinceLastBlock(bsc, blockNumber)

        const size = weight.mul(time)

        const difficulty = bsc.difficulty.mul(
            DIFFICULTY_BASE_MULTIPLIER -
                this.getLogOfRandomCached(
                    user.hashedAddress,
                    bsc.eth_block_checkpoint,
                    blockNumber
                )
        )
        return size.gt(difficulty)
    }

    getLogOfRandomCached(
        userHashedAddress: string,
        currentGoalBlockNumber: number,
        blockNumber: number
    ): number {
        // seed for goal takes a block in the future (+1) so it is harder to manipulate
        let currentGoal = this.etherBlocks.getHash(
            this.getSeed(currentGoalBlockNumber, blockNumber)
        )

        if (
            this.lastLogOfRandom.user === userHashedAddress &&
            this.lastLogOfRandom.goal === currentGoal
        )
            return this.lastLogOfRandom.log

        let log = this.getLogOfRandom(
            userHashedAddress,
            currentGoalBlockNumber,
            blockNumber
        )

        this.lastLogOfRandom.log = log
        this.lastLogOfRandom.user = userHashedAddress
        this.lastLogOfRandom.goal = currentGoal
        return log
    }

    getLogOfRandom(
        userHashedAddress: string,
        currentGoalBlockNumber: number,
        blockNumber: number
    ): number {
        // seed for goal takes a block in the future (+1) so it is harder to manipulate
        let currentGoal = this.etherBlocks.getHash(
            this.getSeed(currentGoalBlockNumber, blockNumber)
        )

        // next line is commented out since we get the user address already hashed
        // bytes32 hashedAddress = keccak256(abi.encodePacked(_user));
        let distance = utils.solidityKeccak256(
            ["bytes32", "bytes32"],
            [userHashedAddress, currentGoal]
        )

        return CartesiMath.log2ApproxTimes1M(
            BigNumber.from(distance)
        ).toNumber()
    }
    getSeed(previousTarget: number, currentBlock: number): number {
        let diff = currentBlock - previousTarget
        let res = Math.trunc(diff / C_256)

        return previousTarget + res * C_256
    }

    getMicrosecondsSinceLastBlock(
        bsc: BlockSelectorContext,
        blockNumber: number
    ): number {
        let blockTimestamp = this.etherBlocks.getTimeStamp(blockNumber)
        return (blockTimestamp - bsc.last_block_timestamp!) * ONE_MILLION
    }
}
