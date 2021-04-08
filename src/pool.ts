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
    StakingPool,
    PoolBalance,
    PoolStake,
    PoolUnstake,
    PoolUser,
    PoolWithdraw,
} from "../generated/schema"
import { StakingPoolImpl } from "../generated/templates"
import { Stake, Unstake, Withdraw } from "../generated/StakingImpl/StakingImpl"
import { NewFlatRateCommissionStakingPool } from "../generated/StakingPoolFactoryImpl/StakingPoolFactoryImpl"
import * as user from "./user"
import * as summary from "./summary"

export function handleNewStakingPool(
    event: NewFlatRateCommissionStakingPool
): void {
    // create pool
    let pool = loadOrCreatePool(event.params.pool, event.block.timestamp)
    pool.commission = event.params.commission
    pool.save()

    let s = summary.loadOrCreate()
    s.totalPools++
    s.save()

    // create template
    StakingPoolImpl.create(event.params.pool)
}

function loadOrCreateBalance(pool: Address, user: Address): PoolBalance {
    let id = pool.toHex() + "-" + user.toHex()
    let balance = PoolBalance.load(id)
    if (balance == null) {
        balance = new PoolBalance(id)
    }
    return balance!
}

function loadOrCreatePool(
    poolAddress: Address,
    timestamp: BigInt = BigInt.fromI32(0)
): StakingPool {
    // create user
    let u = user.loadOrCreate(poolAddress)

    let pool = StakingPool.load(poolAddress.toHex())

    if (pool == null) {
        // create pool
        pool = new StakingPool(poolAddress.toHex())

        pool.user = u.id
        pool.totalUsers = 0
        pool.timestamp = timestamp
    }

    return pool!
}

export function handleStake(event: Stake): void {
    // save user
    let user = new PoolUser(event.params.user.toHex())
    user.save()

    // save entity
    let entity = new PoolStake(event.transaction.hash.toHex())
    entity.pool = event.address.toHex()
    entity.user = event.params.user.toHex()
    entity.value = event.params.amount
    entity.timestamp = event.block.timestamp
    entity.save()

    // update balance
    let balance = loadOrCreateBalance(event.address, event.params.user)

    if (balance.stakedBalance.isZero()) {
        let pool = loadOrCreatePool(event.address)
        pool.totalUsers++
        pool.save()
    }

    balance.stakedBalance = balance.stakedBalance.plus(event.params.amount)
    balance.totalStaked = balance.totalStaked.plus(event.params.amount)
    balance.save()
}

export function handleUnstake(event: Unstake): void {
    // save entity
    let entity = new PoolUnstake(event.transaction.hash.toHex())
    entity.pool = event.address.toHex()
    entity.user = event.params.user.toHex()
    entity.value = event.params.amount
    entity.timestamp = event.block.timestamp
    entity.save()

    // update balance
    let balance = loadOrCreateBalance(event.address, event.params.user)
    balance.stakedBalance = balance.stakedBalance.minus(event.params.amount)
    balance.totalUnstaked = balance.totalUnstaked.plus(event.params.amount)
    balance.save()
}

export function handleWithdraw(event: Withdraw): void {
    // save entity
    let entity = new PoolWithdraw(event.transaction.hash.toHex())
    entity.pool = event.address.toHex()
    entity.user = event.params.user.toHex()
    entity.value = event.params.amount
    entity.timestamp = event.block.timestamp
    entity.save()

    // update balance
    let balance = loadOrCreateBalance(event.address, event.params.user)
    balance.totalWithdraw = balance.totalWithdraw.plus(event.params.amount)
    balance.save()
}
