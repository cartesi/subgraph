import { Range } from "./range"
import { UserState } from "../model/user"
import { BlockSelectorContext } from "../model/blockSelectorContext"

export interface Raw {
    name: string
    block_range: Range
}

type RangeableData = UserState | BlockSelectorContext | Raw

export class ForwardIterator {
    data: RangeableData[]
    index: number

    constructor(data: RangeableData[]) {
        this.data = data
        this.index = 0
    }

    getValidData(num: number): RangeableData {
        do {
            let item = this.data[this.index]
            if (item.block_range.inRange(num)) return item
            this.index++
        } while (this.index < this.data.length)
        throw new Error(`Key could not be found for num: ${num}`)
    }

    reset() {
        this.index = 0
    }
}
