// Copyright 2021 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { NewChain, Rewarded } from "../generated/PoS/PoS"
import * as chains from "./chain"
import { handleRewardedInner, handleBlockProduced } from "./block-common"

export function handleRewarded(event: Rewarded): void {
    let reward = event.params.reward
    handleRewardedInner<Rewarded>(event, reward)
}

export function handleNewChain(event: NewChain): void {
    // handle chain
    let posAddress = event.address.toHex()
    let chain = chains.loadOrCreate(
        posAddress,
        event.params.index.toI32(),
        event.block.timestamp
    )
    chain.targetInterval = event.params.targetInterval.toI32()
    chain.save()
}

export { handleBlockProduced }
