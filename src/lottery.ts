import { PrizePaid } from "../generated/PoS/PoS"
import { RoundClaimed } from "../generated/Lottery/Lottery"
import { Block } from "../generated/schema"
import * as summary from "./summary"
import { loadOrCreate as loadOrCreateStaker } from "./staker"
import { loadOrCreate as loadOrCreateWorker } from "./worker"

export function handlePrizePaid(event: PrizePaid): void {
    // PrizePaid is always called before RoundClaimed, so create Block here
    let block = new Block(event.transaction.hash.toHex())
    block.chainId = event.params.index.toI32()
    block.timestamp = event.block.timestamp
    block.user = event.params.user.toHex()
    block.userPrize = event.params.userPrize
    block.beneficiary = event.params.beneficiary
    block.beneficiaryPrize = event.params.beneficiaryPrize
    block.save()
    summary.addBlock()
    summary.setChainId(block.chainId)

    let staker = loadOrCreateStaker(event.params.user)
    // add one more block to the staker counter
    staker.totalBlocks++
    staker.save()

    let worker = loadOrCreateWorker(
        event.params.user,
        event.params.worker,
        event.block.timestamp
    )
    // add one more ticket to the worker counter
    worker.totalBlocks++

    // add to the total reward acquired by the worker
    let reward = event.params.userPrize.plus(event.params.beneficiaryPrize)
    worker.totalReward = worker.totalReward.plus(reward)
    worker.save()

    // add to the global total reward
    summary.addReward(reward)
}

export function handleRoundClaimed(event: RoundClaimed): void {
    // load Block and fill other properties
    let block = Block.load(event.transaction.hash.toHex())
    if (block) {
        block.producer = event.params._winner
        block.number = event.params._roundCount.toI32()
        block.difficulty = event.params._difficulty
        block.save()
    }
}
