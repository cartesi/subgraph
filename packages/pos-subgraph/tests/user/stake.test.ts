// Copyright 2021 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { assert, clearStore, test, describe, beforeEach } from "matchstick-as"
import { BigInt } from "@graphprotocol/graph-ts"
import { handleStakeEvent } from "../../src/user"
import {
    assertUser,
    createStakeEvent,
    txHash,
    txTimestamp,
    ZERO,
} from "../utils"
import { buildUser } from "./utils"

let address = "0x0000000000000000000000000000000000000000"

describe("User stake", () => {
    beforeEach(() => {
        clearStore()
    })

    test("stake(1000)", () => {
        let amount = BigInt.fromI32(1000)
        let maturationTimestamp = BigInt.fromI32(1630000000 + 21600) // Thursday, August 26, 2021 11:46:40 PM
        let event = createStakeEvent(address, amount, maturationTimestamp)

        handleStakeEvent(event)
        assertUser(address, ZERO, amount, maturationTimestamp, ZERO, ZERO)
        assert.fieldEquals("Stake", txHash.toHexString(), "user", address)
        assert.fieldEquals("Stake", txHash.toHexString(), "value", "1000")
        assert.fieldEquals(
            "Stake",
            txHash.toHexString(),
            "timestamp",
            txTimestamp.toString()
        )
    })

    test("stake(1000) while maturing", () => {
        // create a user with 500 maturing
        let user = buildUser(address)
        user.maturingBalance = BigInt.fromI32(500)
        user.maturingTimestamp = BigInt.fromI32(1630000000 + 10800) // Thursday, August 26, 2021 08:46:40 PM
        user.save()

        let amount = BigInt.fromI32(1500)
        let maturationTimestamp = BigInt.fromI32(txTimestamp + 21600) // Thursday, August 26, 2021 11:46:40 PM
        let event = createStakeEvent(address, amount, maturationTimestamp)
        handleStakeEvent(event)

        assertUser(
            address,
            ZERO,
            BigInt.fromI32(1500),
            maturationTimestamp,
            ZERO,
            ZERO
        )
    })

    test("stake(1000) while matured", () => {
        // create a user with 500 matured and 2000 staked
        let user = buildUser(address)
        user.stakedBalance = BigInt.fromI32(2000)
        user.maturingBalance = BigInt.fromI32(500)
        user.maturingTimestamp = BigInt.fromI32(txTimestamp - 10800) // Thursday, August 26, 2021 02:46:40 PM
        user.save()

        let amount = BigInt.fromI32(1000)
        let maturationTimestamp = BigInt.fromI32(txTimestamp + 21600) // Thursday, August 26, 2021 11:46:40 PM
        let event = createStakeEvent(address, amount, maturationTimestamp)
        handleStakeEvent(event)

        assertUser(
            address,
            BigInt.fromI32(2500),
            amount,
            maturationTimestamp,
            ZERO,
            ZERO
        )
    })

    test("stake(1000) while releasing", () => {
        // create a user with 200 releasing
        let user = buildUser(address)
        user.releasingBalance = BigInt.fromI32(1200)
        user.save()

        let amount = BigInt.fromI32(1000)
        let maturationTimestamp = BigInt.fromI32(txTimestamp + 21600) // Thursday, August 26, 2021 11:46:40 PM
        let event = createStakeEvent(address, amount, maturationTimestamp)
        handleStakeEvent(event)

        assertUser(
            address,
            BigInt.fromI32(0),
            amount,
            maturationTimestamp,
            BigInt.fromI32(200),
            ZERO
        )
    })
})
