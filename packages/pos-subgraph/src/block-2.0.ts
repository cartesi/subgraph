// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { Address } from "@graphprotocol/graph-ts"
import { NewChain } from "../generated/PoSV2FactoryImpl/PoSV2FactoryImpl"
import {
    BlockProduced,
    DifficultyUpdated,
    PoSV2Impl,
} from "../generated/templates/PoSV2Impl/PoSV2Impl"
import {
    Rewarded,
    RewardManagerV2Impl,
} from "../generated/templates/RewardManagerV2Impl/RewardManagerV2Impl"
import {
    PoSV2Impl as posTemplate,
    RewardManagerV2Impl as rewardTemplate,
} from "../generated/templates"
import { Block } from "../generated/schema"
import * as chains from "./chain-2.0"
import * as nodes from "./node"
import * as summary from "./summary"
import * as users from "./user"
import * as blockSelectorContext from "./blockSelectorContext-2.0"

export function handleNewChain(event: NewChain): void {
    // handle chain
    let posAddress = event.params.pos
    let chain = chains.loadOrCreate(
        posAddress.toHex(),
        event.address.toHex(),
        event.block.timestamp
    )
    chain.targetInterval = event.params.targetInterval.toI32()
    chain.save()

    //create BlockSelectorContext
    blockSelectorContext.create(event, chain.number)

    // create PoSV2Impl data source
    posTemplate.create(posAddress)

    // create RewardManagerV2Impl data source
    let pos = PoSV2Impl.bind(posAddress)
    let rewardManagerAddress = pos.rewardManager()
    rewardTemplate.create(rewardManagerAddress)
}

export function handleBlockProduced(event: BlockProduced): void {
    // handle global summary
    let s = summary.loadOrCreate()
    s.totalBlocks++
    s.save()

    // handle chain
    let posAddress = event.address
    let pos = PoSV2Impl.bind(posAddress)
    let chain = chains.loadOrCreate(
        posAddress.toHex(),
        pos.factory().toHex(),
        event.block.timestamp
    )
    chain.totalBlocks++
    chain.save()

    // create Block and fill properties
    let block = new Block(event.transaction.hash.toHex())
    block.timestamp = event.block.timestamp
    block.gasPrice = event.transaction.gasPrice
    block.gasLimit = event.transaction.gasLimit
    block.chain = chain.id
    block.producer = event.params.user.toHex()
    block.node = event.params.worker.toHex()
    block.number = event.params.sidechainBlockNumber.toI32()

    let contextId = blockSelectorContext.contextID(posAddress)
    block.difficulty = blockSelectorContext.getDifficulty(contextId)
    block.save()

    // handle user
    let user = users.loadOrCreate(event.params.user)
    user.totalBlocks++
    user.save()

    // handle node
    let node = nodes.loadOrCreate(
        event.params.user,
        event.params.worker,
        event.block.timestamp
    )
    node.totalBlocks++
    node.status = "Authorized"
    node.save()
}

export function handleDifficultyUpdated(event: DifficultyUpdated): void {
    // save block selected context
    let id = blockSelectorContext.contextID(event.address)
    blockSelectorContext.update(
        id,
        event.block.number,
        event.params.difficulty,
        event.block.timestamp
    )
}

export function handleRewarded(event: Rewarded): void {
    let reward = event.params.reward

    // handle global summary
    let s = summary.loadOrCreate()
    s.totalReward = s.totalReward.plus(reward)
    s.save()

    // handle chain
    let rewardManager = RewardManagerV2Impl.bind(event.address)
    let posAddress = rewardManager.pos()
    let pos = PoSV2Impl.bind(posAddress)
    let chain = chains.loadOrCreate(
        posAddress.toHex(),
        pos.factory().toHex(),
        event.block.timestamp
    )
    chain.totalReward = chain.totalReward.plus(reward)
    chain.save()

    // block should be created by BlockProduced event
    let block = Block.load(event.transaction.hash.toHex())!
    block.reward = reward
    block.save()

    // handle user
    // producer should be created by BlockProduced event
    let user = users.loadOrCreate(Address.fromString(block.producer!))
    user.totalReward = user.totalReward.plus(reward)
    user.save()

    // handle node
    // node should be created by BlockProduced event
    let node = nodes.loadOrCreate(
        Address.fromString(block.producer!),
        Address.fromString(block.node!),
        event.block.timestamp
    )
    node.status = "Authorized"
    node.totalReward = node.totalReward.plus(reward)
    node.save()
}
