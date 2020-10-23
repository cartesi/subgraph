import { BigInt } from "@graphprotocol/graph-ts"
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

    entity.txHash = event.transaction.hash.toHex()
    entity.ticket = event.transaction.hash.toHex()

    entity.save()
}

export function handleRoundClaimed(event: RoundClaimed): void {
    let entity = LotteryTicket.load(event.transaction.hash.toHex())

    if (entity == null) {
        entity = new LotteryTicket(event.transaction.hash.toHex())

        entity.count = BigInt.fromI32(0)
    }

    entity.count = entity.count + BigInt.fromI32(1)

    entity._winner = event.params._winner
    entity._roundCount = event.params._roundCount
    entity._difficulty = event.params._difficulty

    entity.save()
}
