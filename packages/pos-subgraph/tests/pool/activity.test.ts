// Copyright 2021 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { assert, clearStore, test, log } from "matchstick-as"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import {
    buildStakingPool,
    createStakingPoolDepositEvent,
    createStakingPoolStakeEvent,
    createStakingPoolUnstakeEvent,
    createStakingPoolWithdrawEvent,
    txHash,
    txTimestamp,
} from "../utils"
import {
    handleDeposit,
    handleStake,
    handleUnstake,
    handleWithdraw,
    POOL_ACTIVITY_DEPOSIT,
    POOL_ACTIVITY_STAKE,
    POOL_ACTIVITY_UNSTAKE,
    POOL_ACTIVITY_WITHDRAW,
} from "../../src/pool"
import { PoolActivity } from "../../generated/schema"

let POOL_ACTIVITY = "PoolActivity"
const user = Address.fromString("0x0000000000000000000000000000000000000000")
const pool = Address.fromString("0x0000000000000000000000000000000000000001")

test("Deposit event handler should create the correct entry on PoolActivity", () => {
    const amount = BigInt.fromI32(1000)
    let stakeTimestamp = BigInt.fromI32(txTimestamp + 21600) // Thursday, August 26, 2021 11:46:40 PM

    let event = createStakingPoolDepositEvent(user, amount, stakeTimestamp)
    event.address = pool
    handleDeposit(event)

    assert.fieldEquals(
        POOL_ACTIVITY,
        txHash.toHexString(),
        "user",
        user.toHex()
    )

    assert.fieldEquals(
        POOL_ACTIVITY,
        txHash.toHexString(),
        "pool",
        pool.toHex()
    )

    assert.fieldEquals(
        POOL_ACTIVITY,
        txHash.toHexString(),
        "type",
        POOL_ACTIVITY_DEPOSIT
    )

    assert.fieldEquals(
        POOL_ACTIVITY,
        txHash.toHexString(),
        "amount",
        amount.toString()
    )

    let activity = PoolActivity.load(txHash.toHexString())!

    assert.assertNull(activity.get("shares"))

    clearStore()
})

test("Stake event handler should create the correct entry on PoolActivity", () => {
    // create a pool
    let stakingPool = buildStakingPool(pool, user)

    stakingPool.save()

    const amount = BigInt.fromI32(500)
    let shares = BigInt.fromI32(500)

    let event = createStakingPoolStakeEvent(user, amount, shares)
    event.address = pool
    handleStake(event)

    assert.fieldEquals(
        POOL_ACTIVITY,
        txHash.toHexString(),
        "user",
        user.toHex()
    )

    assert.fieldEquals(
        POOL_ACTIVITY,
        txHash.toHexString(),
        "pool",
        pool.toHex()
    )

    assert.fieldEquals(
        POOL_ACTIVITY,
        txHash.toHexString(),
        "type",
        POOL_ACTIVITY_STAKE
    )

    assert.fieldEquals(
        POOL_ACTIVITY,
        txHash.toHexString(),
        "amount",
        amount.toString()
    )

    assert.fieldEquals(
        POOL_ACTIVITY,
        txHash.toHexString(),
        "shares",
        shares.toString()
    )

    clearStore()
})

test("Unstake event handler should create the correct entry on PoolActivity", () => {
    const amount = BigInt.fromI32(500)
    let shares = BigInt.fromI32(500)

    // create a pool
    let stakingPool = buildStakingPool(pool, user)
    stakingPool.save()

    let event = createStakingPoolStakeEvent(user, amount, shares)
    event.address = pool
    // and stake some amount/shares
    handleStake(event)

    // then let's unstake some
    let unstakeEvt = createStakingPoolUnstakeEvent(user, amount, shares)
    unstakeEvt.address = pool
    handleUnstake(unstakeEvt)

    assert.fieldEquals(
        POOL_ACTIVITY,
        txHash.toHexString(),
        "user",
        user.toHex()
    )

    assert.fieldEquals(
        POOL_ACTIVITY,
        txHash.toHexString(),
        "pool",
        pool.toHex()
    )

    assert.fieldEquals(
        POOL_ACTIVITY,
        txHash.toHexString(),
        "type",
        POOL_ACTIVITY_UNSTAKE
    )

    assert.fieldEquals(
        POOL_ACTIVITY,
        txHash.toHexString(),
        "amount",
        amount.toString()
    )

    assert.fieldEquals(
        POOL_ACTIVITY,
        txHash.toHexString(),
        "shares",
        shares.toString()
    )

    clearStore()
})

test("Withdraw event handler should create the correct entry on PoolActivity", () => {
    const amount = BigInt.fromI32(500)
    let event = createStakingPoolWithdrawEvent(user, amount)
    event.address = pool
    // and stake some amount/shares
    handleWithdraw(event)

    assert.fieldEquals(
        POOL_ACTIVITY,
        txHash.toHexString(),
        "user",
        user.toHex()
    )

    assert.fieldEquals(
        POOL_ACTIVITY,
        txHash.toHexString(),
        "pool",
        pool.toHex()
    )

    assert.fieldEquals(
        POOL_ACTIVITY,
        txHash.toHexString(),
        "type",
        POOL_ACTIVITY_WITHDRAW
    )

    assert.fieldEquals(
        POOL_ACTIVITY,
        txHash.toHexString(),
        "amount",
        amount.toString()
    )

    let activityPool = PoolActivity.load(txHash.toHexString())!
    assert.assertNull(activityPool.get("shares"))

    clearStore()
})
