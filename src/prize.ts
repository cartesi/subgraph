import { WinnerPaid } from "../generated/PrizeManager/PrizeManager"
import { Prize } from "../generated/schema"

export function handleWinnerPaid(event: WinnerPaid): void {
    let entity = Prize.load(event.transaction.hash.toHex())

    if (entity == null) {
        entity = new Prize(event.transaction.hash.toHex())
    }

    entity.winner = event.params._winner
    entity.prize = event.params._prize
    entity.time = event.block.timestamp
    entity.save()
}
