// Copyright 2021 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { clearStore, test } from "matchstick-as"
import { BigInt } from "@graphprotocol/graph-ts"
import { handleUnstakeEvent } from "../../src/user"
import { User } from "../../generated/schema"
import { assertUser, createUnstakeEvent, txTimestamp, ZERO } from "../utils"

test("unstake(1000)", () => {
    let address = "0x0000000000000000000000000000000000000000"

    // create a user with 1200 staked
    let user = new User(address)
    user.stakedBalance = BigInt.fromI32(1200)
    user.releasingBalance = BigInt.fromI32(500)
    user.save()

    let amount = BigInt.fromI32(1500)
    let releasingTimestamp = BigInt.fromI32(txTimestamp + 21600) // Thursday, August 26, 2021 11:46:40 PM
    let event = createUnstakeEvent(address, amount, releasingTimestamp)
    handleUnstakeEvent(event)

    assertUser(
        address,
        BigInt.fromI32(200),
        ZERO,
        ZERO,
        amount,
        releasingTimestamp
    )

    clearStore()
})

test("unstake(1000) from maturing", () => {
    let address = "0x0000000000000000000000000000000000000000"

    // create a user with 1200 maturing
    let user = new User(address)
    user.maturingBalance = BigInt.fromI32(1200)
    user.save()

    let amount = BigInt.fromI32(1000)
    let releasingTimestamp = BigInt.fromI32(txTimestamp + 21600) // Thursday, August 26, 2021 11:46:40 PM
    let event = createUnstakeEvent(address, amount, releasingTimestamp)
    handleUnstakeEvent(event)

    assertUser(
        address,
        ZERO,
        BigInt.fromI32(200),
        ZERO,
        amount,
        releasingTimestamp
    )

    clearStore()
})

test("unstake(1000) from maturing and staked", () => {
    let address = "0x0000000000000000000000000000000000000000"

    // create a user with 200 maturing and 1900 staked
    // unstake 1000 must take 200 from maturing and 800 from staked
    let user = new User(address)
    user.maturingBalance = BigInt.fromI32(200)
    user.stakedBalance = BigInt.fromI32(1900)
    user.save()

    let amount = BigInt.fromI32(1000)
    let releasingTimestamp = BigInt.fromI32(txTimestamp + 21600) // Thursday, August 26, 2021 11:46:40 PM
    let event = createUnstakeEvent(address, amount, releasingTimestamp)
    handleUnstakeEvent(event)

    assertUser(
        address,
        BigInt.fromI32(1100),
        BigInt.fromI32(0),
        ZERO,
        amount,
        releasingTimestamp
    )

    clearStore()
})
