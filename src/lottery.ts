import { PrizePaid } from "../generated/PoS/PoS"
import { RoundClaimed } from "../generated/Lottery/Lottery"
import { LotteryTicket } from "../generated/schema"

export function handlePrizePaid(event: PrizePaid): void {
    let entity = LotteryTicket.load(event.transaction.hash.toHex())

    if (entity === null) {
        entity = new LotteryTicket(event.transaction.hash.toHex())
        entity.time = event.block.timestamp
    }

    entity.user = event.params.user
    entity.userPrize = event.params.userPrize
    entity.beneficiary = event.params.beneficiary
    entity.beneficiaryPrize = event.params.beneficiaryPrize
    entity.worker = event.params.worker

    entity.save()
}

export function handleRoundClaimed(event: RoundClaimed): void {
    let entity = LotteryTicket.load(event.transaction.hash.toHex())

    if (entity === null) {
        entity = new LotteryTicket(event.transaction.hash.toHex())
        entity.time = event.block.timestamp
    }

    entity.winner = event.params._winner
    entity.round = event.params._roundCount
    entity.difficulty = event.params._difficulty

    entity.save()
}
