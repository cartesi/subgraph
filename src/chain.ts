// Copyright 2020 Cartesi Pte. Ltd.

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
    address: string,
    id: string,
    timestamp: BigInt
): Chain {
    let chain = Chain.load(id)
    if (chain === null) {
        // load or create protocol
        let protocol = loadOrCreateProtocol(address, timestamp)
        protocol.totalChains++
        protocol.save()

        chain = new Chain(id)
        chain.totalBlocks = 0
        chain.totalReward = BigInt.fromI32(0)
        chain.start = timestamp
        chain.protocol = protocol.id

        let s = summary.loadOrCreate()
        s.totalChains++
        s.save()
    }
    return chain!
}
