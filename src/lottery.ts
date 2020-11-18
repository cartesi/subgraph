import { PrizePaid } from "../generated/PoS/PoS"
import { RoundClaimed } from "../generated/Lottery/Lottery"
import { Block } from "../generated/schema"
import { addBlock, addReward } from "./summary"
import { loadOrCreate as loadOrCreateStaker } from "./staker"
import { loadOrCreate as loadOrCreateWorker } from "./worker"
import { BigInt } from "@graphprotocol/graph-ts"

function loadOrCreate(id: string): Block {
    let block = Block.load(id)
    if (block == null) {
        block = new Block(id)
        addBlock()
    }
    return block!
}

export function handlePrizePaid(event: PrizePaid): void {
    // create/update the block
    let block = loadOrCreate(event.transaction.hash.toHex())
    block.chainId = event.params.index
    block.timestamp = event.block.timestamp
    block.user = event.params.user.toHex()
    block.userPrize = event.params.userPrize
    block.beneficiary = event.params.beneficiary
    block.beneficiaryPrize = event.params.beneficiaryPrize
    block.producer = event.params.worker
    block.save()

    let staker = loadOrCreateStaker(event.params.user)
    // add one more block to the staker counter
    staker.totalBlocks = staker.totalBlocks.plus(BigInt.fromI32(1))
    staker.save()

    let worker = loadOrCreateWorker(
        event.params.user,
        event.params.worker,
        event.block.timestamp
    )
    // add one more ticket to the worker counter
    worker.totalBlocks = worker.totalBlocks.plus(BigInt.fromI32(1))

    // add to the total reward acquired by the worker
    let reward = event.params.userPrize.plus(event.params.beneficiaryPrize)
    worker.totalReward = worker.totalReward.plus(reward)
    worker.save()

    // add to the global total reward
    addReward(reward)
}

export function handleRoundClaimed(event: RoundClaimed): void {
    // create/update the ticket
    let block = loadOrCreate(event.transaction.hash.toHex())
    block.timestamp = event.block.timestamp
    block.producer = event.params._winner
    block.number = event.params._roundCount
    block.difficulty = event.params._difficulty
    block.save()
}
