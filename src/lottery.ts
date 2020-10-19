import { BigInt } from "@graphprotocol/graph-ts"
import { RoundClaimed } from "../generated/Lottery/Lottery"
import { Lottery } from "../generated/schema"

export function handleRoundClaimed(event: RoundClaimed): void {
    let entity = Lottery.load(event.transaction.from.toHex())

    if (entity == null) {
        entity = new Lottery(event.transaction.from.toHex())

        entity.count = BigInt.fromI32(0)
    }

    entity.count = entity.count + BigInt.fromI32(1)

    entity._winner = event.params._winner
    entity._roundCount = event.params._roundCount

    entity.save()
}
