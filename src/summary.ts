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
import { Summary } from "../generated/schema"

export function loadOrCreate(): Summary {
    let summary = Summary.load("1")

    if (summary == null) {
        summary = new Summary("1")
        summary.totalUsers = 0
        summary.totalPools = 0
        summary.totalStakers = 0
        summary.totalNodes = 0
        summary.totalStaked = BigInt.fromI32(0)
        summary.totalBlocks = 0
        summary.totalReward = BigInt.fromI32(0)
        summary.totalTransactionFee = BigInt.fromI32(0)
        summary.totalProtocols = 0
        summary.totalChains = 0
        summary.save()
    }

    return summary
}
