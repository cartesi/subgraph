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
import { Stake, Unstake, User, Withdraw } from "../generated/schema"
import {
    Stake as StakeEvent,
    Unstake as UnstakeEvent,
    Withdraw as WithdrawEvent,
} from "../generated/StakingImpl/StakingImpl"
import * as summary from "./summary"

export { runTests } from "./tests/staking.test"

export function loadOrCreate(address: Address): User {
    let user = User.load(address.toHex())

    if (user == null) {
        user = new User(address.toHex())
        user.stakedBalance = BigInt.fromI32(0)
        user.maturingBalance = BigInt.fromI32(0)
        user.maturingTimestamp = BigInt.fromI32(0)
        user.releasingBalance = BigInt.fromI32(0)
        user.releasingTimestamp = BigInt.fromI32(0)
        user.totalBlocks = 0
        user.totalReward = BigInt.fromI32(0)
        user.save()

        let s = summary.loadOrCreate()
        s.totalUsers++
        s.save()
    }

    return user
}

export function handleStakeEvent(event: StakeEvent): void {
    let user = loadOrCreate(event.params.user)

    // update user
    // the timestamp of the event is the block timestamp + the timeToStake, so we do the reverse here
    let timeToStake = event.params.maturationDate.minus(event.block.timestamp)

    // check if there are mature coins to be staked
    if (user.maturingTimestamp <= event.block.timestamp) {
        user.stakedBalance = user.stakedBalance.plus(user.maturingBalance)
        user.maturingBalance = BigInt.fromI32(0)
    }

    // this is the call amount
    let amount = event.params.amount.minus(user.maturingBalance)

    // update consumed releasing balance
    user.releasingBalance =
        user.releasingBalance >= amount
            ? user.releasingBalance.minus(amount)
            : BigInt.fromI32(0)

    // new maturing amount is the one that comes in the event
    user.maturingBalance = event.params.amount
    user.maturingTimestamp = event.params.maturationDate
    user.save()

    // create a Stake
    let stake = new Stake(event.transaction.hash.toHex())
    stake.user = user.id
    stake.value = amount
    stake.timestamp = event.block.timestamp
    stake.save()

    // update global summary
    let s = summary.loadOrCreate()
    s.totalStaked = s.totalStaked.plus(amount)
    if (user.stakedBalance.isZero()) {
        s.totalStakers++
    }
    s.save()
}

export function handleUnstakeEvent(event: UnstakeEvent): void {
    // update user
    let user = loadOrCreate(event.params.user)

    // this is the call amount
    let amount = event.params.amount.minus(user.releasingBalance)

    // set releasing balance
    user.releasingBalance = event.params.amount
    user.releasingTimestamp = event.params.maturationDate

    // update maturing and staked balances
    if (user.maturingBalance >= amount) {
        user.maturingBalance = user.maturingBalance.minus(amount)
    } else {
        user.stakedBalance = user.stakedBalance.minus(
            amount.minus(user.maturingBalance)
        )
        user.maturingBalance = BigInt.fromI32(0)
    }
    user.save()

    // update global summary
    let s = summary.loadOrCreate()
    s.totalStaked = s.totalStaked.minus(amount)
    if (user.stakedBalance.isZero()) {
        s.totalStakers--
    }
    s.save()

    // create a Unstake
    let unstake = new Unstake(event.transaction.hash.toHex())
    unstake.user = user.id
    unstake.value = amount
    unstake.timestamp = event.block.timestamp
    unstake.save()
}

export function handleWithdrawEvent(event: WithdrawEvent): void {
    // load user
    let user = loadOrCreate(event.params.user)

    // update releasing balance
    user.releasingBalance = user.releasingBalance.minus(event.params.amount)
    user.save()

    // create a Withdraw
    let withdraw = new Withdraw(event.transaction.hash.toHex())
    withdraw.user = user.id
    withdraw.value = event.params.amount
    withdraw.timestamp = event.block.timestamp
    withdraw.save()
}
