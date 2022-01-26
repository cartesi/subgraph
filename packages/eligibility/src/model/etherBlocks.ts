import { KnexDB } from "../db"
import { BigNumber } from "ethers"
import { Range } from "../utils/range"
import stream = require("stream")
import assert from "assert"

export interface Block {
    hash: string
    number: number
    timestamp: number
}

export interface BlockRaw {
    hash: string
    number: string
    timestamp: string
}

export interface EtherBlocks {
    getHash(blockNumber: number): string
    getTimeStamp(blockNumber: number): number
    latestBlock(): Promise<number>
    startStream(
        range: Range,
        onData: (block: Block) => Promise<void>,
        onEnd: () => void
    ): Promise<void>
    clear(): void
    size(): number
}

function fromRaw(block: BlockRaw): Block {
    const hash = `0x${block.hash}`
    const number = parseInt(block.number)
    const timestamp = BigNumber.from(block.timestamp).toNumber()
    return { hash, number, timestamp }
}

export class EtherBlocksClass implements EtherBlocks {
    blocks: Map<number, Block>
    streamOnData: ((block: Block) => Promise<void>) | null
    stream: (stream.PassThrough & AsyncIterable<any>) | null
    blockRange: Range
    db: KnexDB
    lastLoadedBlock: number | undefined

    constructor(db: KnexDB) {
        this.blocks = new Map()
        this.streamOnData = null
        this.stream = null
        this.blockRange = new Range(0, 0)
        this.db = db
    }

    async latestBlock(): Promise<number> {
        // @dev add 30 blocks safety here for reorgs
        const res = await this.db("blocks")
            .select("number")
            .orderBy("number", "desc")
            .limit(1)
        return parseInt(res[0].number) - 30
    }

    async startStream(
        range: Range,
        onData: (block: Block) => Promise<void>,
        onEnd: () => void
    ) {
        console.info(
            `Streaming Ether blocks' info for the range: ${range.toString()}`
        )
        this.blockRange = range
        this.streamOnData = onData
        this.stream = await this._buildSearch(range).stream()
        this.stream.on("data", this._onData.bind(this))
        this.stream.on("end", () => {
            console.log("The block stream has been finished")
            onEnd()
        })
    }

    getHash(blockNumber: number): string {
        if (!this.blocks.has(blockNumber)) {
            console.warn(`Failed to find hash ${blockNumber}.`)
            throw new Error(`failed to find hash ${blockNumber}`)
        }
        return this.blocks.get(blockNumber)!.hash
    }

    clear() {
        const entries = Array.from(this.blocks).slice(this.blocks.size - 257)
        this.blocks.clear()
        this.blocks = new Map(entries)
    }

    getTimeStamp(blockNumber: number): number {
        if (!this.blocks.has(blockNumber)) {
            console.warn(`Failed to find timestamp ${blockNumber}.`)
            throw new Error(`failed to find timestamp ${blockNumber}`)
        }
        return this.blocks.get(blockNumber)!.timestamp
    }

    size(): number {
        return this.blocks.size
    }

    async _onData(b: BlockRaw) {
        this.stream?.pause()
        const block = fromRaw(b)
        this.blocks.set(block.number, block)
        if (this.lastLoadedBlock === undefined)
            this.lastLoadedBlock = block.number
        else {
            assert.equal(
                block.number,
                this.lastLoadedBlock + 1,
                `we couldn't ensure continuity of block streaming last:${this.lastLoadedBlock} vs current:${block.number}`
            )
            this.lastLoadedBlock = block.number
        }
        // only call the handler to the actual start of the range, not the 256 buffer
        if (block.number >= this.blockRange.start)
            await this.streamOnData!(block)
        //clean up old blocks
        if (this.blocks.size > 5000) this.clear()
        this.stream?.resume()
    }

    _buildSearch(range: Range) {
        return this.db("blocks")
            .select(this.db.raw("encode(hash, 'hex') as hash"))
            .select("number")
            .select(this.db.raw("data->'block'->>'timestamp' as timestamp"))
            .whereBetween("number", [range.start - 256, range.end!]) //-256 ensures we always have a past hash
            .orderBy("number", "asc")
    }
}
