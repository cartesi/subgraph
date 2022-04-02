import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Block } from "../generated/schema"
import { Rewarded } from "../generated/PoS/PoS"
import { Rewarded as Rewarded_1_0 } from "../generated/PoS-1.0/PoS"
import * as nodes from "./node"
import * as chains from "./chain"
import * as users from "./user"
import * as summary from "./summary"
import { BlockProduced } from "../generated/BlockSelector/BlockSelector"

export function createBlock(event: ethereum.Event): Block {
    const block = new Block(event.transaction.hash.toHex())
    block.timestamp = event.block.timestamp
    block.gasPrice = event.transaction.gasPrice
    block.gasLimit = event.transaction.gasLimit
    if (event.receipt) {
        block.gasUsed = event.receipt.gasUsed
        block.transactionFee = block.gasUsed.times(block.gasPrice)
    }
    return block
}

export function handleRewardedInner(
    event: Rewarded | Rewarded_1_0,
    reward: BigInt
) {
    // handle node
    let node = nodes.loadOrCreate(
        event.params.user,
        event.params.worker,
        event.block.timestamp
    )
    node.totalBlocks++
    node.status = "Authorized"
    node.totalReward = node.totalReward.plus(reward)
    node.save()

    // handle chain
    let posAddress = event.address.toHex()
    let chain = chains.loadOrCreate(
        posAddress,
        event.params.index.toI32(),
        event.block.timestamp
    )
    chain.totalBlocks++
    chain.totalReward = chain.totalReward.plus(reward)
    chain.save()

    // Rewarded is always called before BlockProduced, so create Block here
    let block = Block.load(event.transaction.hash.toHex())
    if (block == null) {
        block = createBlock(event)
    }
    block.chain = chain.id
    block.reward = reward
    block.producer = event.params.user.toHex()
    block.node = event.params.worker.toHex()
    block.save()

    // handle user
    let user = users.loadOrCreate(event.params.user)
    user.totalBlocks++
    user.totalReward = user.totalReward.plus(reward)
    user.totalTransactionFee = user.totalTransactionFee.plus(
        block.transactionFee
    )
    user.save()

    // handle global summary
    let s = summary.loadOrCreate()
    s.totalBlocks++
    s.totalReward = s.totalReward.plus(reward)
    s.totalTransactionFee = s.totalTransactionFee.plus(block.transactionFee)
    s.save()
}

export function handleBlockProduced(event: BlockProduced): void {
    // load Block and fill other properties
    let block = Block.load(event.transaction.hash.toHex())
    if (block == null) {
        block = createBlock(event)
    }
    block.number = event.params.blockNumber.toI32()
    block.difficulty = event.params.difficulty
    block.save()
}
