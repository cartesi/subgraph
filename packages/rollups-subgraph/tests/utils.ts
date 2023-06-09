// Copyright 2023 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import { newMockEvent } from "matchstick-as"
import { ApplicationCreated } from "../generated/CartesiDAppFactory/CartesiDAppFactory"
import { ApplicationCreated as ApplicationCreated08 } from "../generated/CartesiDAppFactory-0.8/CartesiDAppFactory"
import { InputAdded } from "../generated/templates/CartesiDAppInput/InputFacet"

export const txHash = Bytes.fromHexString(
    "0x0000000000000000000000000000000000000000000000000000000000000001"
) as Bytes

export const dummyAddress = Address.fromString(
    "0x0000000000000000000000000000000000000001"
)

/**
 * represents the UTC datetime Thursday, August 26, 2021 05:46:40 PM
 */
export const txTimestamp = 1630000000
export const ZERO = BigInt.fromI32(0)

export function createApplicationCreatedEventV06(
    newTimestamp: BigInt,
    factoryAddress: Address,
    appAddress: Address
): ApplicationCreated {
    return buildEvent<ApplicationCreated>(
        newTimestamp,
        factoryAddress,
        appAddress
    )
}

export function createApplicationCreatedEventV08(
    newTimestamp: BigInt,
    factoryAddress: Address,
    appAddress: Address
): ApplicationCreated08 {
    return buildEvent<ApplicationCreated08>(
        newTimestamp,
        factoryAddress,
        appAddress
    )
}

export function createInputAddedEvent(
    timestamp: BigInt,
    dappAddress: Address
): InputAdded {
    let event = changetype<InputAdded>(newMockEvent)
    event.transaction.hash = txHash
    event.block.timestamp = timestamp
    event.address = dappAddress

    return event
}

// UTILITIES

let factoryNumber = 100
let dappNumber = 200

export function nextDappAddress(): Address {
    const address = Address.fromString(
        "0x0000000000000000000000000000000000000" + dappNumber.toString()
    )
    dappNumber++
    return address
}

export function nextFactoryAddress(): Address {
    const address = Address.fromString(
        "0x0000000000000000000000000000000000000" + factoryNumber.toString()
    )

    factoryNumber++
    return address
}

function buildEvent<T extends ethereum.Event>(
    newTimestamp: BigInt,
    factoryAddress: Address,
    appAddress: Address
): T {
    let event = changetype<T>(newMockEvent)
    event.transaction.hash = txHash
    event.block.timestamp = newTimestamp
    event.address = factoryAddress
    event.parameters = new Array()

    event.parameters.push(
        new ethereum.EventParam(
            "application",
            ethereum.Value.fromAddress(appAddress)
        )
    )

    event.parameters.push(
        new ethereum.EventParam(
            "config",
            ethereum.Value.fromTuple(buildConfig())
        )
    )

    return event
}

/**
 * Mocking with dummy data the event param called config that is sent from versions 0.6 ~ 0.8
 * @returns ethereum.Tuple
 */
function buildConfig(): ethereum.Tuple {
    const arrayAddress = new Array<Address>()
    arrayAddress.push(
        Address.fromString("0x0000000000000000000000000000000000000094")
    )

    let values = new ethereum.Tuple()

    //diamondOwner
    values.push(ethereum.Value.fromAddress(dummyAddress))
    //templateHash
    values.push(ethereum.Value.fromBytes(Bytes.empty()))
    //inputDuration
    values.push(ethereum.Value.fromSignedBigInt(BigInt.fromI32(86400)))
    //challengePeriod
    values.push(ethereum.Value.fromSignedBigInt(BigInt.fromI32(604800)))
    //inputLog2Size
    values.push(ethereum.Value.fromSignedBigInt(ZERO))
    // feePerClaim
    values.push(ethereum.Value.fromSignedBigInt(ZERO))
    // feeManagerOwner
    values.push(
        ethereum.Value.fromAddress(
            Address.fromString("0x0000000000000000000000000000000000000002")
        )
    )
    // validators
    values.push(ethereum.Value.fromAddressArray(arrayAddress))

    return values
}
