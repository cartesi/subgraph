// Copyright 2021 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { Address, BigInt, Bytes, store } from "@graphprotocol/graph-ts"
import {
    Block,
    StakingPool,
    StakingPoolFee,
    PoolBalance,
    PoolShareValue,
    PoolUser,
    User,
    PoolActivity,
    StakingPoolUserHistory,
    Protocol,
    WeeklyPoolPerformance,
} from "../generated/schema"
import { PoSV2Impl } from "../generated/templates/PoSV2Impl/PoSV2Impl"
import { StakingPoolImpl } from "../generated/templates/StakingPoolImpl/StakingPoolImpl"
import {
    FlatRateCommission as flateRateTemplate,
    GasTaxCommission as gasTaxTemplate,
    StakingPoolImpl as poolTemplate,
} from "../generated/templates"
import {
    Deposit,
    Stake,
    Unstake,
    Withdraw,
} from "../generated/templates/StakingPoolImpl/StakingPoolImpl"
import {
    NewFlatRateCommissionStakingPool,
    NewGasTaxCommissionStakingPool,
} from "../generated/StakingPoolFactoryImpl/StakingPoolFactoryImpl"
import * as user from "./user"
import * as summary from "./summary"
import {
    BlockProduced,
    Paused,
    Unpaused,
} from "../generated/templates/StakingPoolImpl/StakingPoolImpl"

// wasm does not like ts enum definition so old-plain variables will do it.
export let POOL_ACTIVITY_DEPOSIT = "DEPOSIT"
export let POOL_ACTIVITY_STAKE = "STAKE"
export let POOL_ACTIVITY_UNSTAKE = "UNSTAKE"
export let POOL_ACTIVITY_WITHDRAW = "WITHDRAW"
export let STAKING_POOL_USER_HIST_ACTION_JOIN = "JOIN"
export let STAKING_POOL_USER_HIST_ACTION_LEAVE = "LEAVE"

export function handleNewFlatRateStakingPool(
    event: NewFlatRateCommissionStakingPool
): void {
    // create pool
    let pool = createPool(
        event.params.pool,
        event.transaction.from,
        event.block.timestamp
    )

    pool.fee = event.params.fee.toHex()
    pool.save()

    // create fee
    let fee = new StakingPoolFee(event.params.fee.toHex())
    fee.created = event.block.timestamp
    fee.lastUpdated = event.block.timestamp
    fee.pool = event.params.pool.toHex()
    fee.save()

    let s = summary.loadOrCreate()
    s.totalPools++
    s.save()

    // create templates
    poolTemplate.create(event.params.pool)
    flateRateTemplate.create(event.params.fee)
}

export function handleNewGasTaxStakingPool(
    event: NewGasTaxCommissionStakingPool
): void {
    // create pool
    let pool = createPool(
        event.params.pool,
        event.transaction.from,
        event.block.timestamp
    )
    pool.fee = event.params.fee.toHex()
    pool.save()

    // create fee
    let fee = new StakingPoolFee(event.params.fee.toHex())
    fee.created = event.block.timestamp
    fee.lastUpdated = event.block.timestamp
    fee.pool = event.params.pool.toHex()
    fee.save()

    let s = summary.loadOrCreate()
    s.totalPools++
    s.save()

    // create templates
    poolTemplate.create(event.params.pool)
    gasTaxTemplate.create(event.params.fee)
}

function loadOrCreateBalance(pool: Address, user: Address): PoolBalance {
    let id = pool.toHex() + "-" + user.toHex()
    let balance = PoolBalance.load(id)
    if (balance == null) {
        balance = new PoolBalance(id)
        balance.pool = pool.toHex()
        balance.user = user.toHex()
        balance.shares = BigInt.fromI32(0)
        balance.balance = BigInt.fromI32(0)
        balance.stakeTimestamp = BigInt.fromI32(0)
    }
    return balance
}

function createPool(
    address: Address,
    manager: Address,
    timestamp: BigInt = BigInt.fromI32(0)
): StakingPool {
    // create user
    let u = user.loadOrCreate(address)

    // create pool
    let pool = new StakingPool(address.toHex())

    // get protocol
    let protocol = getProtocolOfPool(address)
    if (protocol != null) {
        pool.protocol = protocol.id
    }

    pool.manager = manager.toHex()
    pool.user = u.id
    pool.amount = BigInt.fromI32(0)
    pool.shares = BigInt.fromI32(0)
    pool.totalUsers = 0
    pool.totalCommission = BigInt.fromI32(0)
    pool.timestamp = timestamp
    pool.paused = false

    // circular reference between pool and user
    u.pool = pool.id
    u.save()

    return pool
}

export function getProtocolOfPool(address: Address): Protocol | null {
    // determine protocol from pos, it should be either V1 or V2
    // V1 pos address is also the protocol id
    // V2 can get protocol from the factory

    let stakingPool = StakingPoolImpl.bind(address)
    let pos = stakingPool.pos()

    // attempt V1 first
    let protocol = Protocol.load(pos.toHex())
    if (protocol == null) {
        // attempt V2 if it's not V1
        let factory = PoSV2Impl.bind(pos).factory()
        protocol = Protocol.load(factory.toHex())
    }

    return protocol
}

/**
 *
 * @param blockHash transaction hash
 * @param timestamp the block timestamp
 * @param pool pool address
 * @param user user address
 * @param totalUsers total number of users in that instant
 * @param action user action towards staking (JOIN | LEAVE)
 * @returns
 */
function createStakingPoolUserHistory(
    txHash: Bytes,
    timestamp: BigInt,
    pool: Address,
    user: Address,
    totalUsers: i32,
    action: string
): StakingPoolUserHistory | null {
    // history entry id is transaction hash + pool address hexed
    const id = txHash.toHex() + "-" + pool.toHex()
    const instance = new StakingPoolUserHistory(id)
    instance.action = action
    instance.totalUsers = totalUsers
    instance.timestamp = timestamp
    instance.user = user.toHex()
    instance.pool = pool.toHex()
    instance.save()

    return instance
}

export function handleDeposit(event: Deposit): void {
    // save user
    let user = new PoolUser(event.params.user.toHex())
    user.save()

    // save new deposit activity
    let activity = new PoolActivity(event.transaction.hash.toHex())
    activity.pool = event.address.toHex()
    activity.user = event.params.user.toHex()
    activity.amount = event.params.amount
    activity.timestamp = event.block.timestamp
    activity.type = POOL_ACTIVITY_DEPOSIT
    activity.save()

    // update balance
    let balance = loadOrCreateBalance(event.address, event.params.user)
    balance.balance = balance.balance.plus(event.params.amount)
    balance.stakeTimestamp = event.params.stakeTimestamp
    balance.save()
}

export function handleStake(event: Stake): void {
    // save user
    let user = new PoolUser(event.params.user.toHex())
    user.save()

    // save new stake activity
    let activity = new PoolActivity(event.transaction.hash.toHex())
    activity.pool = event.address.toHex()
    activity.user = event.params.user.toHex()
    activity.amount = event.params.amount
    activity.shares = event.params.shares
    activity.timestamp = event.block.timestamp
    activity.type = POOL_ACTIVITY_STAKE
    activity.save()

    // update balance
    let balance = loadOrCreateBalance(event.address, event.params.user)

    if (balance.shares.isZero()) {
        // increment number of users
        let pool = StakingPool.load(event.address.toHex())!
        pool.totalUsers++
        pool.save()
        // Adding historical entry for the Staking Pool and User interaction
        createStakingPoolUserHistory(
            event.transaction.hash,
            event.block.timestamp,
            event.address,
            event.params.user,
            pool.totalUsers,
            STAKING_POOL_USER_HIST_ACTION_JOIN
        )
    }

    balance.shares = balance.shares.plus(event.params.shares)
    balance.balance = balance.balance.minus(event.params.amount)
    balance.save()

    // update pool
    let pool = StakingPool.load(event.address.toHex())!
    pool.amount = pool.amount.plus(event.params.amount)
    pool.shares = pool.shares.plus(event.params.shares)
    pool.save()
}

export function handleUnstake(event: Unstake): void {
    // save new unstake activity
    let activity = new PoolActivity(event.transaction.hash.toHex())
    activity.pool = event.address.toHex()
    activity.user = event.params.user.toHex()
    activity.shares = event.params.shares
    activity.amount = event.params.amount
    activity.timestamp = event.block.timestamp
    activity.type = POOL_ACTIVITY_UNSTAKE
    activity.save()

    // update balance
    let balance = loadOrCreateBalance(event.address, event.params.user)
    balance.shares = balance.shares.minus(event.params.shares)
    balance.balance = balance.balance.plus(event.params.amount)
    balance.save()

    // update pool
    let pool = StakingPool.load(event.address.toHex())!
    if (balance.shares.isZero()) {
        // decrement number of users
        pool.totalUsers--
        createStakingPoolUserHistory(
            event.transaction.hash,
            event.block.timestamp,
            event.address,
            event.params.user,
            pool.totalUsers,
            STAKING_POOL_USER_HIST_ACTION_LEAVE
        )
    }
    pool.shares = pool.shares.minus(event.params.shares)
    pool.amount = pool.amount.minus(event.params.amount)
    pool.save()
}

export function handleWithdraw(event: Withdraw): void {
    // save new withdraw activity
    let activity = new PoolActivity(event.transaction.hash.toHex())
    activity.pool = event.address.toHex()
    activity.user = event.params.user.toHex()
    activity.amount = event.params.amount
    activity.timestamp = event.block.timestamp
    activity.type = POOL_ACTIVITY_WITHDRAW
    activity.save()

    // update balance
    let balance = loadOrCreateBalance(event.address, event.params.user)
    balance.balance = balance.balance.minus(event.params.amount)

    if (balance.balance.isZero() && balance.shares.isZero()) {
        store.remove("PoolBalance", balance.id)
    } else {
        balance.save()
    }
}

export function handleBlockProduced(event: BlockProduced): void {

    // save block commission
    let block = Block.load(event.transaction.hash.toHex())
    if (block) {
        block.commission = event.params.commission
        block.save()
    }

    let pool = StakingPool.load(event.address.toHex())!
    let user = User.load(event.address.toHex())!
    let totalReward = user.totalReward

    // increment the total commission of the pool
    let totalCommission = pool.totalCommission.plus(event.params.commission)
    pool.totalCommission = totalCommission

    // calculate the commission percentage
    let commissionPercentage = totalCommission.divDecimal(
        totalReward.toBigDecimal()
    )
    pool.commissionPercentage = commissionPercentage

    // increment the pool amount
    let remainingReward = event.params.reward.minus(event.params.commission)
    pool.amount = pool.amount.plus(remainingReward)
    pool.save()

    // save pool share value
    let shareValue = new PoolShareValue(event.transaction.hash.toHex())
    shareValue.pool = pool.id
    shareValue.timestamp = event.block.timestamp
    shareValue.value = pool.amount
        .times(BigInt.fromString("1000000000"))
        .divDecimal(pool.shares.toBigDecimal())
    shareValue.save()

    // save to weeklyPoolPerformance 
    let week = event.block.timestamp.toI32() / 604800
    let weeklyPoolPerformanceId = pool.id + '-' + week.toString()
    // Collection Address - Week
    let weeklyPoolPerformance = new WeeklyPoolPerformance(weeklyPoolPerformanceId)
    
    if (!weeklyPoolPerformance) {
        weeklyPoolPerformance = new WeeklyPoolPerformance(weeklyPoolPerformanceId)
        weeklyPoolPerformance.timestamp = event.block.timestamp
        weeklyPoolPerformance.pool = pool.id
        weeklyPoolPerformance.shareValue = pool.amount
        .times(BigInt.fromString("1000000000"))
        .divDecimal(pool.shares.toBigDecimal())
        
        // Check the previous week shareValue, if there is any value reduce the current week shareValue with the previous week share value. If it is null, then set the current week shareValue as performance
        let previousWeek = week - 1
        let previousWeekId = pool.id + '-' + previousWeek.toString()
        let previousWeekPerformance = new WeeklyPoolPerformance(previousWeekId) 
        let weeklyPerformance = previousWeekPerformance ? previousWeekPerformance.shareValue : BigInt.fromI32(1).toBigDecimal()
        weeklyPoolPerformance.performance = weeklyPoolPerformance.shareValue.minus(weeklyPerformance)
    }
    // Updating weekly share value
    weeklyPoolPerformance.performance = pool.amount
        .times(BigInt.fromString("1000000000"))
        .divDecimal(pool.shares.toBigDecimal())
    weeklyPoolPerformance.save()
}

export function handlePaused(event: Paused): void {
    let pool = StakingPool.load(event.address.toHex())!
    pool.paused = true
    pool.save()
}

export function handleUnpaused(event: Unpaused): void {
    let pool = StakingPool.load(event.address.toHex())!
    pool.paused = false
    pool.save()
}
