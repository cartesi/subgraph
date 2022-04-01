// Copyright 2022 Cartesi Pte. Ltd.

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
    buildStakingPool,
    createStakingPoolDepositEvent,
    createStakingPoolStakeEvent,
    createStakingPoolUnstakeEvent,
    createStakingPoolWithdrawEvent,
    txTimestamp,
} from "../utils"
import {
    handleDeposit,
    handleStake,
    handleUnstake,
    handleWithdraw,
} from "../../src/pool"
import { PoolBalance } from "../../generated/schema"

let POOL_BALANCE = "PoolBalance"
const user = Address.fromString("0x0000000000000000000000000000000000000000")
const pool = Address.fromString("0x0000000000000000000000000000000000000001")

function buildPoolBalanceId(pool: Address, user: Address): string {
    return pool.toHex() + "-" + user.toHex()
}

function createPoolBalance(pool: Address, user: Address): PoolBalance {
    let balance = new PoolBalance(buildPoolBalanceId(pool, user))
    balance.pool = pool.toHex()
    balance.user = user.toHex()
    balance.shares = BigInt.fromI32(0)
    balance.balance = BigInt.fromI32(0)
    balance.stakeTimestamp = BigInt.fromI32(0)
    return balance
}

test("[PoolBalance] Deposit event should increase the balance", () => {
    const amount = BigInt.fromI32(1000)
    let timestamp = BigInt.fromI32(txTimestamp + 21600) // Thursday, August 26, 2021 11:46:40 PM

    let event = createStakingPoolDepositEvent(user, amount, timestamp)
    event.address = pool
    handleDeposit(event)
    let poolBalanceId = buildPoolBalanceId(pool, event.params.user)

    assert.fieldEquals(
        POOL_BALANCE,
        poolBalanceId,
        "balance",
        amount.toString()
    )

    assert.fieldEquals(POOL_BALANCE, poolBalanceId, "shares", "0")

    clearStore()
})

test("[PoolBalance] Stake event should increase shares and decrease the balance by the same amount", () => {
    // create a pool
    let stakingPool = buildStakingPool(pool, user)
    let poolBalanceId = buildPoolBalanceId(pool, user)

    stakingPool.save()

    //making a deposit to build balance
    let depAmount = BigInt.fromI32(1000)
    let timestamp = BigInt.fromI32(txTimestamp + 21600)
    let depEvt = createStakingPoolDepositEvent(user, depAmount, timestamp)
    depEvt.address = pool
    handleDeposit(depEvt)

    assert.fieldEquals(
        POOL_BALANCE,
        poolBalanceId,
        "balance",
        depAmount.toString()
    )
    assert.fieldEquals(POOL_BALANCE, poolBalanceId, "shares", "0")

    // Going to stake only half
    const amount = BigInt.fromI32(500)
    let shares = BigInt.fromI32(500)

    let event = createStakingPoolStakeEvent(user, amount, shares)
    event.address = pool
    handleStake(event)

    assert.fieldEquals(
        POOL_BALANCE,
        poolBalanceId,
        "balance",
        depAmount.minus(amount).toString()
    )

    assert.fieldEquals(POOL_BALANCE, poolBalanceId, "shares", amount.toString())

    clearStore()
})

test("[PoolBalance] Unstake event should decrease number of shares and increase the balance", () => {
    const amount = BigInt.fromI32(1000)
    const shares = BigInt.fromI32(500)

    // create a pool
    let stakingPool = buildStakingPool(pool, user)
    stakingPool.save()
    // For breviaty lets skip deposit/stake pieces
    let balance = createPoolBalance(pool, user)
    balance.balance = amount
    balance.shares = shares
    balance.stakeTimestamp = BigInt.fromI32(txTimestamp + 21600)
    balance.save()

    const poolBalanceId = buildPoolBalanceId(pool, user)

    // should be saved with expected values
    assert.fieldEquals(
        POOL_BALANCE,
        poolBalanceId,
        "balance",
        amount.toString()
    )
    assert.fieldEquals(POOL_BALANCE, poolBalanceId, "shares", shares.toString())

    // then let's unstake some
    let unstakeEvt = createStakingPoolUnstakeEvent(user, shares, shares)
    unstakeEvt.address = pool
    handleUnstake(unstakeEvt)

    assert.fieldEquals(
        POOL_BALANCE,
        poolBalanceId,
        "balance",
        amount.plus(shares).toString()
    )

    assert.fieldEquals(POOL_BALANCE, poolBalanceId, "shares", "0")

    clearStore()
})

test("[PoolBalance] Withdraw event should not remove pool-balance entry when zeroed the balance but not the shares", () => {
    const amount = BigInt.fromI32(500)
    const shares = BigInt.fromI32(3000)

    const balance = createPoolBalance(pool, user)
    balance.balance = amount
    balance.shares = shares
    balance.save()

    const event = createStakingPoolWithdrawEvent(user, amount)
    event.address = pool
    handleWithdraw(event)

    const poolBalanceId = buildPoolBalanceId(pool, user)

    assert.assertNotNull(PoolBalance.load(poolBalanceId))
    clearStore()
})

test("[PoolBalance] Withdraw event should not remove pool-balance entry when shares are zero but balance is not zero", () => {
    const amount = BigInt.fromI32(500)
    const balance = createPoolBalance(pool, user)
    balance.balance = BigInt.fromI32(550)
    balance.save()

    const event = createStakingPoolWithdrawEvent(user, amount)
    event.address = pool
    handleWithdraw(event)

    const poolBalanceId = buildPoolBalanceId(pool, user)

    assert.assertNotNull(PoolBalance.load(poolBalanceId))
    assert.fieldEquals(POOL_BALANCE, poolBalanceId, "shares", "0")
    assert.fieldEquals(
        POOL_BALANCE,
        poolBalanceId,
        "balance",
        BigInt.fromI32(50).toString()
    )
    clearStore()
})

test("[PoolBalance] Withdraw event should remove the pool-balance entry when both balance and shares are zero", () => {
    const amount = BigInt.fromI32(500)
    const balance = createPoolBalance(pool, user)
    balance.balance = amount
    balance.save()

    const event = createStakingPoolWithdrawEvent(user, amount)
    event.address = pool
    handleWithdraw(event)
    const poolBalanceId = buildPoolBalanceId(pool, user)

    assert.assertNull(PoolBalance.load(poolBalanceId))

    clearStore()
})
