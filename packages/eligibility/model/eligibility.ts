import { KnexDB } from "../db"
import { BigNumber } from "ethers"

import { Range } from "../utils/range"

export interface Eligibility {
    id: string
    user: string
    stake: BigNumber
    block: number
    block_selector: string
    eligible: boolean
    block_range: Range
    vid?: number
}

interface EligibilityRaw {
    id: string
    user: string
    stake: string
    block: string
    block_selector: string
    eligible: boolean
    block_range: string
    vid?: number
}

export class EligibilityModel {
    last: Eligibility | undefined
    data: EligibilityRaw[]

    user: string
    blockSelector: string // BlockSelectorContext ID "address-chainid"
    db: KnexDB
    constructor(user: string, blockSelector: string, db: KnexDB) {
        this.data = []
        this.user = user
        this.blockSelector = blockSelector
        this.db = db
    }
    /// loads the last eligibility entry if it exists
    async load() {
        const last = await this.db<EligibilityRaw>("eligibility")
            .select("*")
            .where("user", this.user)
            .andWhere("block_selector", this.blockSelector)
            .orderBy("vid", "desc")
            .limit(1)
        if (last && last[0]) {
            this.last = {
                vid: last[0].vid,
                id: last[0].id,
                user: last[0].user,
                stake: BigNumber.from(last[0].stake),
                block: parseInt(last[0].block),
                block_selector: this.blockSelector,
                eligible: last[0].eligible,
                block_range: Range.fromRangeString(last[0].block_range),
            }
        }
    }

    push(
        stake: BigNumber,
        eth_block_checkpoint: number,
        eligible: boolean,
        currentBlock: number
    ) {
        const id = this._buildId(eth_block_checkpoint)
        if (!this._changedEntry(id, stake, eligible)) return // Nothing changed. Just adding more blocks to current status

        if (this.last) {
            // if we already had one entry on-going, we close it before starting a new one
            this.last.block_range.end = currentBlock
            this._updateList()
        }
        this._startEntry(stake, eth_block_checkpoint, eligible, currentBlock)
    }

    _startEntry(
        stake: BigNumber,
        eth_block_checkpoint: number,
        eligible: boolean,
        currentBlock: number
    ) {
        const range = new Range(currentBlock)
        this.last = {
            id: this._buildId(eth_block_checkpoint),
            user: this.user,
            stake,
            block: eth_block_checkpoint,
            block_selector: this.blockSelector,
            eligible,
            block_range: range,
        }
    }

    _buildId(eth_block_checkpoint: number): string {
        return `${eth_block_checkpoint}-${this.user}-${this.blockSelector}`
    }

    _changedEntry(id: string, stake: BigNumber, eligible: boolean): boolean {
        return (
            !this.last ||
            this.last.id !== id ||
            !this.last.stake.eq(stake) ||
            this.last.eligible !== eligible
        )
    }

    _updateList() {
        if (!this.last) return
        this.data.push({
            ...this.last,
            block: this.last.block.toString(),
            stake: this.last.stake.toString(),
            block_range: this.last.block_range.toString(),
        })
    }

    async save(): Promise<void> {
        this._updateList()
        if (this.data.length >= 1)
            await this.db<EligibilityRaw>("eligibility")
                .insert([this.data[0]])
                .onConflict(["vid"])
                .merge(["block_range"])

        if (this.data.length >= 2)
            await this.db.batchInsert<EligibilityRaw>(
                "eligibility",
                this.data.slice(1)
            )
    }

    async saveAndReset(): Promise<void> {
        await this.save()
        await this.load() // make sure we have last with the correct vid
        this.data = []
    }
}
