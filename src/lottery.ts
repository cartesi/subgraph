import { PrizePaid } from "../generated/PoS/PoS"
import { RoundClaimed } from "../generated/Lottery/Lottery"
import { LotteryTicket } from "../generated/schema"
import { addTicket } from "./summary"

function loadOrCreate(id: string): LotteryTicket {
    let ticket = LotteryTicket.load(id)
    if (ticket == null) {
        ticket = new LotteryTicket(id)
        addTicket()
    }
    return ticket!
}

export function handlePrizePaid(event: PrizePaid): void {
    let ticket = loadOrCreate(event.transaction.hash.toHex())
    ticket.timestamp = event.block.timestamp
    ticket.user = event.params.user.toHex()
    ticket.userPrize = event.params.userPrize
    ticket.beneficiary = event.params.beneficiary
    ticket.beneficiaryPrize = event.params.beneficiaryPrize
    ticket.worker = event.params.worker.toHex()
    ticket.save()
}

export function handleRoundClaimed(event: RoundClaimed): void {
    let ticket = loadOrCreate(event.transaction.hash.toHex())
    ticket.timestamp = event.block.timestamp
    ticket.winner = event.params._winner
    ticket.round = event.params._roundCount
    ticket.difficulty = event.params._difficulty
    ticket.save()
}
