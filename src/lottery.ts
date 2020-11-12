import { PrizePaid } from "../generated/PoS/PoS"
import { RoundClaimed } from "../generated/Lottery/Lottery"
import { LotteryTicket } from "../generated/schema"
import { addTicket, addReward } from "./summary"
import { loadOrCreate as loadOrCreateStaker } from "./staker"
import { loadOrCreate as loadOrCreateWorker } from "./worker"
import { BigInt } from "@graphprotocol/graph-ts"

function loadOrCreate(id: string): LotteryTicket {
    let ticket = LotteryTicket.load(id)
    if (ticket == null) {
        ticket = new LotteryTicket(id)
        addTicket()
    }
    return ticket!
}

export function handlePrizePaid(event: PrizePaid): void {
    // create/update the ticket
    let ticket = loadOrCreate(event.transaction.hash.toHex())
    ticket.timestamp = event.block.timestamp
    ticket.user = event.params.user.toHex()
    ticket.userPrize = event.params.userPrize
    ticket.beneficiary = event.params.beneficiary
    ticket.beneficiaryPrize = event.params.beneficiaryPrize
    ticket.worker = event.params.worker.toHex()
    ticket.save()

    let staker = loadOrCreateStaker(event.params.user)
    // add one more ticket to the staker counter
    staker.totalTickets = staker.totalTickets.plus(BigInt.fromI32(1))
    staker.save()

    let worker = loadOrCreateWorker(
        event.params.user,
        event.params.worker,
        event.block.timestamp
    )
    // add one more ticket to the worker counter
    worker.totalTickets = worker.totalTickets.plus(BigInt.fromI32(1))

    // add to the total reward acquired by the worker
    let reward = event.params.userPrize.plus(event.params.beneficiaryPrize)
    worker.totalReward = worker.totalReward.plus(reward)
    worker.save()

    // add to the global total reward
    addReward(reward)
}

export function handleRoundClaimed(event: RoundClaimed): void {
    // create/update the ticket
    let ticket = loadOrCreate(event.transaction.hash.toHex())
    ticket.timestamp = event.block.timestamp
    ticket.winner = event.params._winner
    ticket.round = event.params._roundCount
    ticket.difficulty = event.params._difficulty
    ticket.save()
}
