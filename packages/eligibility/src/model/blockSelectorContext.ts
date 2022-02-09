import { KnexDB } from "../db"
import { BigNumber } from "ethers"
import { Range } from "../utils/range"
import { ForwardIterator } from "../utils/forwardIterator"
export interface BlockSelectorContext {
    id?: string
    index?: number
    min_difficulty: BigNumber
    target_interval: number
    difficulty_adjustment_parameter: number
    eth_block_checkpoint: number
    difficulty: BigNumber
    eth_block_goal_hash?: string
    last_block_timestamp: number
    vid?: number
    block_range: Range
}

interface BlockSelectorContextRaw {
    id?: string
    index?: string
    min_difficulty: string
    target_interval: string
    difficulty_adjustment_parameter: string
    eth_block_checkpoint: string
    difficulty: string
    eth_block_goal_hash?: string
    last_block_timestamp: string
    vid?: string
    block_range: string
}

function fromRaw(entry: BlockSelectorContextRaw): BlockSelectorContext {
    const {
        // id,
        // index,
        min_difficulty,
        target_interval,
        difficulty_adjustment_parameter,
        eth_block_checkpoint,
        difficulty,
        // eth_block_goal_hash,
        last_block_timestamp,
        // vid,
        block_range,
    } = entry
    return {
        // id,
        // index,
        min_difficulty: BigNumber.from(min_difficulty),
        target_interval: parseInt(target_interval),
        difficulty_adjustment_parameter: parseInt(
            difficulty_adjustment_parameter
        ),
        eth_block_checkpoint: parseInt(eth_block_checkpoint),
        difficulty: BigNumber.from(difficulty),
        // eth_block_goal_hash,
        last_block_timestamp: parseInt(last_block_timestamp),
        // vid,
        block_range: Range.fromRangeString(block_range),
    }
}

export async function findChainRange(
    blockSelectorAddress: string,
    chainId: number,
    latestBlock: number,
    db: KnexDB
): Promise<Range> {
    let id = `${blockSelectorAddress.toLowerCase()}-${chainId}`
    let data = await db("block_selector_context")
        .select(db.raw("lower(block_range) as start"))
        .orderBy("vid", "asc")
        .where("id", id)
        .limit(1)
    let { start } = data[0] as any
    return new Range(start, latestBlock)
}
export class BlockSelectorContextState {
    states: ForwardIterator
    id: string
    latestBlock: number
    db: KnexDB

    constructor(
        blockSelectorAddress: string,
        chainId: number,
        latestBlock: number,
        db: KnexDB
    ) {
        this.id = `${blockSelectorAddress.toLowerCase()}-${chainId}`
        this.latestBlock = latestBlock
        this.states = new ForwardIterator([])
        this.db = db
    }

    async loadContext(): Promise<void> {
        console.info("Loading Block Selector States")
        let data = await this.db<BlockSelectorContextRaw>(
            "block_selector_context"
        )
            .select("min_difficulty")
            .select("target_interval")
            .select("difficulty_adjustment_parameter")
            .select("eth_block_checkpoint")
            .select("last_block_timestamp")
            .select("difficulty")
            .select("block_range")
            .where("id", this.id)
            .orderBy("vid", "asc")

        this.states = new ForwardIterator(data.map(fromRaw))
        console.log(
            `This chain has ${this.getTotalRangeBlocks()} ethereum blocks`
        )
    }

    getContext(blockNumber: number): BlockSelectorContext {
        return this.states.getValidData(blockNumber) as BlockSelectorContext
    }

    reset() {
        this.states.reset()
    }

    getLowerLimitStateRange(): number {
        let data = this.states.data[0] as BlockSelectorContext
        return Math.min(data.block_range.start, data.eth_block_checkpoint)
    }

    getUpperLimitStateRange(): number {
        let end = (
            this.states.data[
                this.states.data.length - 1
            ] as BlockSelectorContext
        ).block_range.end
        if (end) return Math.min(end!, this.latestBlock)
        return this.latestBlock
    }

    getTotalRangeBlocks(): number {
        return this.getUpperLimitStateRange() - this.getLowerLimitStateRange()
    }
}
