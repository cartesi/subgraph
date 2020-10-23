import { WinnerPaid } from "../generated/PrizeManager/PrizeManager"
import { RoundClaimed } from "../generated/Lottery/Lottery"
import { LotteryWinner, LotteryTicket } from "../generated/schema"

export function handleWinnerPaid(event: WinnerPaid): void {
    let entity = new LotteryWinner(
        event.transaction.hash.toHex() + "-" + event.logIndex.toString()
    )

    entity.winner = event.params._winner
    entity.prize = event.params._prize
    entity.time = event.block.timestamp

    entity.ticket = event.transaction.hash.toHex()

    entity.save()
}

export function handleRoundClaimed(event: RoundClaimed): void {
    let entity = new LotteryTicket(event.transaction.hash.toHex())

    entity.winner = event.params._winner
    entity.roundCount = event.params._roundCount
    entity.difficulty = event.params._difficulty

    entity.save()
}
