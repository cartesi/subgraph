// Copyright 2021 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { assert, newMockEvent } from "matchstick-as"
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import { Stake, Unstake, Withdraw } from "../generated/StakingImpl/StakingImpl"
import { StakingPoolFee } from "../generated/schema"
import { FlatRateChanged } from "../generated/templates/FlatRateCommission/FlatRateCommission"

export const txHash = Bytes.fromHexString(
    "0x0000000000000000000000000000000000000000000000000000000000000001"
) as Bytes
export const txTimestamp = 1630000000
export const ZERO = BigInt.fromI32(0)

export function buildStakingPoolFee(
    address: Address,
    pool: Address,
    timestamp: BigInt
): StakingPoolFee {
    let fee = new StakingPoolFee(address.toHex())
    fee.created = timestamp
    fee.lastUpdated = timestamp
    fee.pool = pool.toHex()
    return fee
}

export function createFlateRateChangedEvent(
    address: Address,
    newRate: BigInt,
    newTimestamp: BigInt
): FlatRateChanged {
    let event = changetype<FlatRateChanged>(newMockEvent())
    event.transaction.hash = txHash
    event.block.timestamp = newTimestamp
    event.address = address
    event.parameters = new Array()
    event.parameters.push(
        new ethereum.EventParam(
            "newRate",
            ethereum.Value.fromUnsignedBigInt(newRate)
        )
    )

    return event
}

export function createStakeEvent(
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

export function createUnstakeEvent(
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

export function createWithdrawEvent(user: string, amount: BigInt): Withdraw {
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

export function assertUser(
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
    assert.fieldEquals(
        "User",
        address,
        "balance",
        stakedBalance.plus(maturingBalance).toString()
    )
}
