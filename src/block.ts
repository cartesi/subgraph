// Copyright 2020 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { Rewarded } from "../generated/PoS/PoS"
import { BlockProduced } from "../generated/BlockSelector/BlockSelector"
import { Block } from "../generated/schema"
import * as chains from "./chain"
import * as nodes from "./node"
import * as summary from "./summary"
import * as users from "./user"

export function handleRewarded(event: Rewarded): void {
    let reward = event.params.userReward.plus(event.params.beneficiaryReward)

    // handle user
    let user = users.loadOrCreate(event.params.user)
    user.totalBlocks++
    user.totalReward = user.totalReward.plus(reward)
    user.save()

    // handle node
    let node = nodes.loadOrCreate(
        event.params.user,
        event.params.worker,
        event.block.timestamp
    )
    node.totalBlocks++
    node.totalReward = node.totalReward.plus(reward)
    node.save()

    // handle chain
    let chain = chains.loadOrCreate(
        event.params.index.toString(),
        event.block.timestamp
    )
    chain.totalBlocks++
    chain.totalReward = chain.totalReward.plus(reward)
    chain.save()

    // Rewarded is always called before BlockProduced, so create Block here
    let block = new Block(event.transaction.hash.toHex())
    block.chain = event.params.index.toString()
    block.timestamp = event.block.timestamp
    block.reward = reward
    block.producer = event.params.user.toHex()
    block.node = event.params.worker.toHex()
    block.save()

    // handle global summary
    let s = summary.loadOrCreate()
    s.totalBlocks++
    s.totalReward = s.totalReward.plus(reward)
    s.save()
}

export function handleBlockProduced(event: BlockProduced): void {
    // load Block and fill other properties
    let block = Block.load(event.transaction.hash.toHex())
    if (block != null) {
        block.number = event.params.blockNumber.toI32()
        block.difficulty = event.params.difficulty
        block.save()

        // fill chain targetInterval
        // let chain = Chain.load(block.chain)
        // chain!.targetInterval = event.params.targetInterval
        // chain!.save()
    }
}
