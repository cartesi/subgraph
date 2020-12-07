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
import { User } from "../generated/schema"
import { Stake, Unstake } from "../generated/StakingImpl/StakingImpl"
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

export function handleStake(event: Stake): void {
    let user = loadOrCreate(event.params.user)
    user.stakedBalance = user.stakedBalance.plus(event.params.amount)
    user.save()

    let s = summary.loadOrCreate()
    s.totalStaked = s.totalStaked.plus(event.params.amount)
    s.save()
}

export function handleUnstake(event: Unstake): void {
    let user = loadOrCreate(event.params.user)
    user.stakedBalance = user.stakedBalance.minus(event.params.amount)
    user.save()

    let s = summary.loadOrCreate()
    s.totalStaked = s.totalStaked.minus(event.params.amount)
    s.save()
}
