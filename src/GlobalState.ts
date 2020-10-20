import {
    Entity,
    Value,
    ValueKind,
    store,
    BigInt,
} from "@graphprotocol/graph-ts"

export class GlobalState extends Entity {
    constructor(id: string) {
        super()
        this.set("id", Value.fromString(id))
    }

    save(): void {
        let id = this.get("id")
        assert(id !== null, "Cannot save GlobalState entity without an ID")
        assert(
            id.kind == ValueKind.STRING,
            "Cannot save GlobalState entity with non-string ID. " +
                'Considering using .toHex() to convert the "id" to a string.'
        )
        store.set("GlobalState", id.toString(), this)
    }

    static load(id: string): GlobalState | null {
        return store.get("GlobalState", id) as GlobalState | null
    }

    get id(): string {
        let value = this.get("id")
        return value.toString()
    }

    set id(value: string) {
        this.set("id", Value.fromString(value))
    }

    get currentIndex(): BigInt {
        let value = this.get("currentIndex")
        return value.toBigInt()
    }

    set currentIndex(value: BigInt) {
        this.set("currentIndex", Value.fromBigInt(value))
    }
}
