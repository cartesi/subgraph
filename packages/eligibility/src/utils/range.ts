export class Range {
    start: number
    end: number | undefined

    constructor(start: number, end?: number | undefined) {
        this.start = start
        this.end = end
    }

    static fromRangeString(range: string): Range {
        const [start, end] = range.split(",")
        return new Range(
            parseInt(start.substring(1)),
            end.length === 1 ? undefined : parseInt(end.substring(-1))
        )
    }

    inRange(num: number): boolean {
        //@dev  num <= this.end ; num can be equal to this.end
        // because thegraph alters the data at the ethblock that the block was produced
        // this means that the information used by the EVM on the blockchain is actually inclusive of 'end' range
        // and exclusive of 'start' range [when producing blocks]
        return num >= this.start && num <= (this.end || Number.MAX_SAFE_INTEGER)
    }

    underRange(num: number): boolean {
        return num < this.start
    }

    overRange(num: number): boolean {
        return num > (this.end || Number.MAX_SAFE_INTEGER)
    }

    toString(): string {
        return `[${this.start},${this.end || ""})`
    }
}
