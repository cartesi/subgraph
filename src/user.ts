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
import { Stake, Unstake, User, Withdraw } from "../generated/schema"
import {
    Stake as StakeEvent,
    StakeCall,
    Unstake as UnstakeEvent,
    UnstakeCall,
    Withdraw as WithdrawEvent,
    WithdrawCall,
} from "../generated/StakingImpl/StakingImpl"
import * as summary from "./summary"

export function loadOrCreate(address: Address): User {
    let user = User.load(address.toHex())

    if (user == null) {
        user = new User(address.toHex())
        user.stakedBalance = BigInt.fromI32(0)
        user.totalBlocks = 0
        user.totalReward = BigInt.fromI32(0)
        user.save()

        let s = summary.loadOrCreate()
        s.totalUsers++
        s.save()
    }

    return user
}

export function handleStakeCall(call: StakeCall): void {
    let user = loadOrCreate(call.from)

    // update global summary
    let s = summary.loadOrCreate()
    s.totalStaked = s.totalStaked.plus(call.inputs._amount)
    if (user.stakedBalance.isZero()) {
        s.totalStakers++
    }
    s.save()

    // update user
    user.stakedBalance = user.stakedBalance.plus(call.inputs._amount)
    user.save()

    // create a Stake
    let stake = new Stake(call.transaction.hash.toHex())
    stake.user = user.id
    stake.value = call.inputs._amount
    stake.timestamp = call.block.timestamp
    stake.save()
}

export function handleStakeEvent(event: StakeEvent): void {
    let user = loadOrCreate(event.params.user)

    // update global summary
    let s = summary.loadOrCreate()
    s.totalStaked = s.totalStaked.plus(event.params.amount)
    if (user.stakedBalance.isZero()) {
        s.totalStakers++
    }
    s.save()

    // update user
    user.stakedBalance = user.stakedBalance.plus(event.params.amount)
    user.save()

    // create a Stake
    let stake = new Stake(event.transaction.hash.toHex())
    stake.user = user.id
    stake.value = event.params.amount
    stake.timestamp = event.block.timestamp
    stake.save()
}

export function handleUnstakeCall(call: UnstakeCall): void {
    // update user
    let user = loadOrCreate(call.from)
    user.stakedBalance = user.stakedBalance.minus(call.inputs._amount)
    user.save()

    // update global summary
    let s = summary.loadOrCreate()
    s.totalStaked = s.totalStaked.minus(call.inputs._amount)
    if (user.stakedBalance.isZero()) {
        s.totalStakers--
    }
    s.save()

    // create a Unstake
    let unstake = new Unstake(call.transaction.hash.toHex())
    unstake.user = user.id
    unstake.value = call.inputs._amount
    unstake.timestamp = call.block.timestamp
    unstake.save()
}

export function handleUnstakeEvent(event: UnstakeEvent): void {
    // update user
    let user = loadOrCreate(event.params.user)
    user.stakedBalance = user.stakedBalance.minus(event.params.amount)
    user.save()

    // update global summary
    let s = summary.loadOrCreate()
    s.totalStaked = s.totalStaked.minus(event.params.amount)
    if (user.stakedBalance.isZero()) {
        s.totalStakers--
    }
    s.save()

    // create a Unstake
    let unstake = new Unstake(event.transaction.hash.toHex())
    unstake.user = user.id
    unstake.value = event.params.amount
    unstake.timestamp = event.block.timestamp
    unstake.save()
}

export function handleWithdrawCall(call: WithdrawCall): void {
    // load user
    let user = loadOrCreate(call.from)

    // create a Withdraw
    let withdraw = new Withdraw(call.transaction.hash.toHex())
    withdraw.user = user.id
    withdraw.value = call.inputs._amount
    withdraw.timestamp = call.block.timestamp
    withdraw.save()
}

export function handleWithdrawEvent(event: WithdrawEvent): void {
    // load user
    let user = loadOrCreate(event.params.user)

    // create a Withdraw
    let withdraw = new Withdraw(event.transaction.hash.toHex())
    withdraw.user = user.id
    withdraw.value = event.params.amount
    withdraw.timestamp = event.block.timestamp
    withdraw.save()
}
