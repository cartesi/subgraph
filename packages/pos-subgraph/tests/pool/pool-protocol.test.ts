// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { assert, clearStore, createMockedFunction, test, log } from "matchstick-as"
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import {
    buildStakingPool,
    createAuthorizationEvent,
    createNewFlatRateCommissionStakingPoolEvent,
    protocol1,
    protocol2
} from "../utils"
import { handleAuthorization } from "../../src/node"
import { handleNewFlatRateStakingPool } from "../../src/pool"
import * as protocol from "../../src/protocol"

const poolAddress = Address.fromString("0x0000000000000000000000000000000000000121")

test("New staking-pool should store protocol", () => {
    // add protocol1
    let p1 = protocol.loadOrCreate(protocol1, BigInt.fromI32(0))
    p1.save()

    // create staking pool, protocol is initialized to protocol1
    let newPoolEvent = createNewFlatRateCommissionStakingPoolEvent(poolAddress)

    createMockedFunction(poolAddress, "pos", "pos():(address)").returns([ethereum.Value.fromAddress(Address.fromString(protocol1))])
    handleNewFlatRateStakingPool(newPoolEvent)

    assert.fieldEquals(
        "StakingPool",
        poolAddress.toHex(),
        "protocol",
        protocol1
    )

    clearStore()
})

test("Staking-pool should update protocol when reauthorized", () => {
    let pos = Address.fromString("0x0000000000000000000000000000000000000120")

    // create staking pool, protocol is initialized to protocol1
    let pool = buildStakingPool(poolAddress, Address.zero())
    pool.save()

    assert.fieldEquals(
        "StakingPool",
        poolAddress.toHex(),
        "protocol",
        protocol1
    )

    // add protocol2
    let p2 = protocol.loadOrCreate(protocol2, BigInt.fromI32(0))
    p2.save()

    // create authorization event to update protocol to protocol2
    let authorization = createAuthorizationEvent(poolAddress)

    createMockedFunction(poolAddress, "pos", "pos():(address)").returns([ethereum.Value.fromAddress(pos)])
    createMockedFunction(pos, "factory", "factory():(address)").returns([ethereum.Value.fromAddress(Address.fromString(protocol2))])
    handleAuthorization(authorization)

    assert.fieldEquals(
        "StakingPool",
        poolAddress.toHex(),
        "protocol",
        protocol2
    )

    clearStore()
})
