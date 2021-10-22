// Copyright 2021 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { assert, clearStore, log, newMockEvent, test } from "matchstick-as"
import { logStore } from "matchstick-as/assembly/store"
import {
    Address,
    BigInt,
    ByteArray,
    Bytes,
    ethereum,
} from "@graphprotocol/graph-ts"
import {
    handleStakeEvent,
    handleUnstakeEvent,
    handleWithdrawEvent,
} from "../user"
import {
    Stake,
    Unstake,
    Withdraw,
} from "../../generated/StakingImpl/StakingImpl"
import { User } from "../../generated/schema"

let ZERO = BigInt.fromI32(0)
let txHash = Bytes.fromHexString(
    "0x0000000000000000000000000000000000000000000000000000000000000001"
) as Bytes
let txTimestamp = 1630000000

function createStakeEvent(
    user: string,
    amount: BigInt,
    maturationDate: BigInt
): Stake {
    let event = changetype<Stake>(newMockEvent())
    event.transaction.hash = txHash
    event.block.timestamp = BigInt.fromI32(txTimestamp) // Thursday, August 26, 2021 05:46:40 PM
    event.parameters = new Array()
    event.parameters.push(
        new ethereum.EventParam(
            "user",
            ethereum.Value.fromAddress(Address.fromString(user))
        )
    )
    event.parameters.push(
        new ethereum.EventParam(
            "amount",
            ethereum.Value.fromUnsignedBigInt(amount)
        )
    )
    event.parameters.push(
        new ethereum.EventParam(
            "maturationDate",
            ethereum.Value.fromUnsignedBigInt(maturationDate)
        )
    )
    return event
}

function createUnstakeEvent(
    user: string,
    amount: BigInt,
    maturationDate: BigInt
): Unstake {
    let event = changetype<Unstake>(newMockEvent())
    event.transaction.hash = txHash
    event.block.timestamp = BigInt.fromI32(1630000000) // Thursday, August 26, 2021 05:46:40 PM
    event.parameters = new Array()
    event.parameters.push(
        new ethereum.EventParam(
            "user",
            ethereum.Value.fromAddress(Address.fromString(user))
        )
    )
    event.parameters.push(
        new ethereum.EventParam(
            "amount",
            ethereum.Value.fromUnsignedBigInt(amount)
        )
    )
    event.parameters.push(
        new ethereum.EventParam(
            "maturationDate",
            ethereum.Value.fromUnsignedBigInt(maturationDate)
        )
    )
    return event
}

function createWithdrawEvent(user: string, amount: BigInt): Withdraw {
    let event = changetype<Withdraw>(newMockEvent())
    event.transaction.hash = txHash
    event.block.timestamp = BigInt.fromI32(1630000000) // Thursday, August 26, 2021 05:46:40 PM
    event.parameters = new Array()
    event.parameters.push(
        new ethereum.EventParam(
            "user",
            ethereum.Value.fromAddress(Address.fromString(user))
        )
    )
    event.parameters.push(
        new ethereum.EventParam(
            "amount",
            ethereum.Value.fromUnsignedBigInt(amount)
        )
    )
    return event
}

function assertUser(
    address: string,
    stakedBalance: BigInt,
    maturingBalance: BigInt,
    maturingTimestamp: BigInt,
    releasingBalance: BigInt,
    releasingTimestamp: BigInt
): void {
    assert.fieldEquals("User", address, "id", address)
    assert.fieldEquals(
        "User",
        address,
        "stakedBalance",
        stakedBalance.toString()
    )
    assert.fieldEquals(
        "User",
        address,
        "maturingBalance",
        maturingBalance.toString()
    )
    assert.fieldEquals(
        "User",
        address,
        "maturingTimestamp",
        maturingTimestamp.toString()
    )
    assert.fieldEquals(
        "User",
        address,
        "releasingBalance",
        releasingBalance.toString()
    )
    assert.fieldEquals(
        "User",
        address,
        "releasingTimestamp",
        releasingTimestamp.toString()
    )
}

export function runTests(): void {
    test("stake(1000)", () => {
        let address = "0x0000000000000000000000000000000000000000"
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

        clearStore()
    })

    test("stake(1000) while maturing", () => {
        let address = "0x0000000000000000000000000000000000000000"

        // create a user with 500 maturing
        let user = new User(address)
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

        clearStore()
    })

    test("stake(1000) while matured", () => {
        let address = "0x0000000000000000000000000000000000000000"

        // create a user with 500 matured and 2000 staked
        let user = new User(address)
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

        clearStore()
    })

    test("stake(1000) while releasing", () => {
        let address = "0x0000000000000000000000000000000000000000"

        // create a user with 200 releasing
        let user = new User(address)
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

        clearStore()
    })

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

    test("withdraw(1000)", () => {
        let address = "0x0000000000000000000000000000000000000000"

        // create a user with 1200 releasing balance
        let user = new User(address)
        user.releasingBalance = BigInt.fromI32(1200)
        user.save()

        let amount = BigInt.fromI32(1000)
        let event = createWithdrawEvent(address, amount)
        handleWithdrawEvent(event)

        assertUser(address, ZERO, ZERO, ZERO, BigInt.fromI32(200), ZERO)

        clearStore()
    })
}
