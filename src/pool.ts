// Copyright 2021 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { Address, BigInt } from "@graphprotocol/graph-ts"
import {
    Block,
    StakingPool,
    StakingPoolFee,
    PoolBalance,
    PoolStake,
    PoolUnstake,
    PoolUser,
    PoolWithdraw,
    PoolDeposit,
} from "../generated/schema"
import {
    FlatRateCommission,
    GasTaxCommission,
    StakingPoolImpl,
} from "../generated/templates"
import {
    Deposit,
    Stake,
    Unstake,
    Withdraw,
} from "../generated/templates/StakingPoolImpl/StakingPoolImpl"
import { NewFlatRateCommissionStakingPool } from "../generated/StakingPoolFactoryImpl/StakingPoolFactoryImpl"
import { NewGasTaxCommissionStakingPool } from "../generated/StakingPoolFactoryImpl/StakingPoolFactoryImpl"
import * as user from "./user"
import * as summary from "./summary"
import {
    BlockProduced,
    Paused,
    Unpaused,
} from "../generated/templates/StakingPoolImpl/StakingPoolImpl"

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
    StakingPoolImpl.create(event.params.pool)
    FlatRateCommission.create(event.params.fee)
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
    StakingPoolImpl.create(event.params.pool)
    GasTaxCommission.create(event.params.fee)
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
    return balance!
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

export function handleDeposit(event: Deposit): void {
    // save user
    let user = new PoolUser(event.params.user.toHex())
    user.save()

    // save deposit entity
    let entity = new PoolDeposit(event.transaction.hash.toHex())
    entity.pool = event.address.toHex()
    entity.user = event.params.user.toHex()
    entity.amount = event.params.amount
    entity.timestamp = event.block.timestamp
    entity.save()

    // update balance
    let balance = loadOrCreateBalance(event.address, event.params.user)

    if (balance.shares.isZero()) {
        // increment number of users
        let pool = StakingPool.load(event.address.toHex())!
        pool.totalUsers++
        pool.save()
    }

    balance.balance = balance.balance.plus(event.params.amount)
    balance.stakeTimestamp = event.params.stakeTimestamp
    balance.save()
}

export function handleStake(event: Stake): void {
    // save user
    let user = new PoolUser(event.params.user.toHex())
    user.save()

    // save stake entity
    let entity = new PoolStake(event.transaction.hash.toHex())
    entity.pool = event.address.toHex()
    entity.user = event.params.user.toHex()
    entity.amount = event.params.amount
    entity.shares = event.params.shares
    entity.timestamp = event.block.timestamp
    entity.save()

    // update balance
    let balance = loadOrCreateBalance(event.address, event.params.user)

    if (balance.shares.isZero()) {
        // increment number of users
        let pool = StakingPool.load(event.address.toHex())!
        pool.totalUsers++
        pool.save()
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
    // save entity
    let entity = new PoolUnstake(event.transaction.hash.toHex())
    entity.pool = event.address.toHex()
    entity.user = event.params.user.toHex()
    entity.shares = event.params.shares
    entity.amount = event.params.amount
    entity.timestamp = event.block.timestamp
    entity.save()

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
    }
    pool.shares = pool.shares.minus(event.params.shares)
    pool.amount = pool.amount.minus(event.params.amount)
    pool.save()
}

export function handleWithdraw(event: Withdraw): void {
    // save entity
    let entity = new PoolWithdraw(event.transaction.hash.toHex())
    entity.pool = event.address.toHex()
    entity.user = event.params.user.toHex()
    entity.amount = event.params.amount
    entity.timestamp = event.block.timestamp
    entity.save()

    // update balance
    let balance = loadOrCreateBalance(event.address, event.params.user)
    balance.balance = balance.balance.minus(event.params.amount)
    balance.save()
}

export function handleBlockProduced(event: BlockProduced): void {
    // save block commission
    let block = Block.load(event.transaction.hash.toHex())
    if (block) {
        block.commission = event.params.commission
        block.save()
    }

    let pool = StakingPool.load(event.address.toHex())!

    // increment the total commission of the pool
    pool.totalCommission = pool.totalCommission.plus(event.params.commission)

    // increment the pool amount
    let remainingReward = event.params.reward.minus(event.params.commission)
    pool.amount = pool.amount.plus(remainingReward)
    pool.save()
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
