// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { BigInt } from "@graphprotocol/graph-ts"
import { Chain } from "../generated/schema"
import * as summary from "./summary"
import { loadOrCreate as loadOrCreateProtocol } from "./protocol"

export function loadOrCreate(
    posAddress: string,
    factoryAddress: string,
    timestamp: BigInt
): Chain {
    let id = posAddress
    let chain = Chain.load(id)
    if (chain === null) {
        let s = summary.loadOrCreate()
        s.totalChains++
        s.save()

        // load or create protocol
        let protocol = loadOrCreateProtocol(factoryAddress, timestamp)
        let index = protocol.totalChains
        protocol.totalChains++
        protocol.save()

        chain = new Chain(id)
        chain.number = index
        chain.totalBlocks = 0
        chain.totalReward = BigInt.fromI32(0)
        chain.start = timestamp
        chain.protocol = protocol.id
    }
    return chain
}
