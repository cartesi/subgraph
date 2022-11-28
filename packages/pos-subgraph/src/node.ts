// Copyright 2020 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { Address, BigInt } from "@graphprotocol/graph-ts"
import { Node, StakingPool } from "../generated/schema"
import { getProtocolOfPool } from "./pool"
import * as summary from "./summary"
import * as users from "./user"
import {
    Authorization,
    Deauthorization,
    JobAccepted,
    JobOffer,
    JobRejected,
    Retired,
} from "../generated/WorkerManagerAuthManager/WorkerManagerAuthManagerImpl"

export function loadOrCreate(
    userAddress: Address,
    nodeAddress: Address,
    timestamp: BigInt
): Node {
    let node = Node.load(nodeAddress.toHex())
    let user = users.loadOrCreate(userAddress)

    if (node === null) {
        node = new Node(nodeAddress.toHex())
        node.owner = user.id
        node.timestamp = timestamp
        node.totalBlocks = 0
        node.totalReward = BigInt.fromI32(0)

        let s = summary.loadOrCreate()
        s.totalNodes++
        s.save()
    }

    return node
}

export function handleJobOffer(event: JobOffer): void {
    let node = loadOrCreate(
        event.params.user,
        event.params.worker,
        event.block.timestamp
    )
    node.status = "Pending"
    node.save()
}

export function handleJobAccepted(event: JobAccepted): void {
    let node = loadOrCreate(
        event.params.user,
        event.params.worker,
        event.block.timestamp
    )
    node.status = "Owned"
    node.save()
}

export function handleJobRejected(event: JobRejected): void {
    let node = loadOrCreate(
        event.params.user,
        event.params.worker,
        event.block.timestamp
    )
    node.status = "Available"
    node.save()
}

export function handleRetired(event: Retired): void {
    let node = loadOrCreate(
        event.params.user,
        event.params.worker,
        event.block.timestamp
    )
    node.status = "Retired"
    node.save()

    let s = summary.loadOrCreate()
    s.totalNodes--
    s.save()
}

export function handleAuthorization(event: Authorization): void {
    let node = loadOrCreate(
        event.params.user,
        event.params.worker,
        event.block.timestamp
    )
    node.status = "Authorized"
    node.save()

    // if the worker is a pool, update its protocol field
    let pool = StakingPool.load(event.params.worker.toHex())
    if (pool != null) {
        let protocol = getProtocolOfPool(event.params.worker)
        if (protocol != null) {
            pool.protocol = protocol.id
            pool.save()
        }
    }
}

export function handleDeauthorization(event: Deauthorization): void {
    let node = loadOrCreate(
        event.params.user,
        event.params.worker,
        event.block.timestamp
    )
    node.status = "Deauthorized"
    node.save()
}
