// Copyright 2021 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { assert, clearStore, test } from "matchstick-as"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import {
    buildStakingPoolFee,
    createFlateRateChangedEvent,
    txTimestamp,
} from "./utils"
import { handleFlatRateChanged } from "../../src/fee"

let STAKING_POOL_FEE = "StakingPoolFee"

test("New staking-pool-fee should store expected values", () => {
    const address = Address.fromString(
        "0x0000000000000000000000000000000000000000"
    )
    const pool = Address.fromString(
        "0x0000000000000000000000000000000000000001"
    )
    const timestamp = BigInt.fromI32(txTimestamp)

    const stakingPoolFee = buildStakingPoolFee(address, pool, timestamp)

    stakingPoolFee.save()

    assert.fieldEquals(
        "StakingPoolFee",
        address.toHex(),
        "created",
        timestamp.toString()
    )
    assert.fieldEquals(
        "StakingPoolFee",
        address.toHex(),
        "lastUpdated",
        timestamp.toString()
    )
    assert.fieldEquals("StakingPoolFee", address.toHex(), "pool", pool.toHex())

    clearStore()
})

test("When handling flat-rate-changed event the updated staking-pool-fee should have the expected values", () => {
    // creating a staking-pool-fee
    const address = Address.fromString(
        "0x0000000000000000000000000000000000000000"
    )
    const pool = Address.fromString(
        "0x0000000000000000000000000000000000000001"
    )
    const timestamp = BigInt.fromI32(txTimestamp)
    const stakingPoolFee = buildStakingPoolFee(address, pool, timestamp)
    stakingPoolFee.save()

    assert.fieldEquals(STAKING_POOL_FEE, address.toHex(), "pool", pool.toHex())
    assert.fieldEquals(
        STAKING_POOL_FEE,
        address.toHex(),
        "created",
        timestamp.toString()
    )
    assert.fieldEquals(
        STAKING_POOL_FEE,
        address.toHex(),
        "lastUpdated",
        timestamp.toString()
    )

    // then generate an flat-rate-changed-event to the same address
    const newRate = BigInt.fromI32(500)
    const newTimestamp = BigInt.fromI32(txTimestamp + 12000)
    const event = createFlateRateChangedEvent(address, newRate, newTimestamp)

    handleFlatRateChanged(event)

    assert.fieldEquals(
        STAKING_POOL_FEE,
        address.toHex(),
        "lastUpdated",
        newTimestamp.toString()
    )
    assert.fieldEquals(
        STAKING_POOL_FEE,
        address.toHex(),
        "commission",
        newRate.toString()
    )

    assert.fieldEquals(STAKING_POOL_FEE, address.toHex(), "pool", pool.toHex())
    assert.fieldEquals(
        STAKING_POOL_FEE,
        address.toHex(),
        "created",
        timestamp.toString()
    )
})
