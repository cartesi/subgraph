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
import { Stake, User } from "../generated/schema"
import { StakeCall, UnstakeCall } from "../generated/StakingImpl/StakingImpl"
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

    return user!
}

export function handleStake(call: StakeCall): void {
    // update user
    let user = loadOrCreate(call.from)
    user.stakedBalance = user.stakedBalance.plus(call.inputs._amount)
    user.save()

    // update global summary
    let s = summary.loadOrCreate()
    s.totalStaked = s.totalStaked.plus(call.inputs._amount)
    s.save()

    // create a Stake
    let stake = new Stake(call.transaction.hash.toHex())
    stake.user = user.id
    stake.value = call.inputs._amount
    stake.timestamp = call.block.timestamp
    stake.save()
}

export function handleUnstake(call: UnstakeCall): void {
    // update user
    let user = loadOrCreate(call.from)
    user.stakedBalance = user.stakedBalance.minus(call.inputs._amount)
    user.save()

    // update global summary
    let s = summary.loadOrCreate()
    s.totalStaked = s.totalStaked.minus(call.inputs._amount)
    s.save()

    // create a Stake
    let stake = new Stake(call.transaction.hash.toHex())
    stake.user = user.id
    stake.value = call.inputs._amount.neg()
    stake.timestamp = call.block.timestamp
    stake.save()
}
