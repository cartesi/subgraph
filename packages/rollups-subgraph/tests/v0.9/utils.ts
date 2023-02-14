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
import { InputAdded } from "../../generated/InputBox/InputBox"
import { ApplicationCreated } from "../../generated/CartesiDAppFactory-0.9/CartesiDAppFactory"
import { dummyAddress, txHash, ZERO } from "../utils"

export function createInputAddedEvent(
    timestamp: BigInt,
    dappAddress: Address
): InputAdded {
    let event = changetype<InputAdded>(newMockEvent)
    event.address = dummyAddress
    event.block.timestamp = timestamp
    event.parameters = new Array()

    event.parameters.push(
        new ethereum.EventParam("dapp", ethereum.Value.fromAddress(dappAddress))
    )

    event.parameters.push(
        new ethereum.EventParam(
            "inboxInputIndex",
            ethereum.Value.fromSignedBigInt(ZERO)
        )
    )

    event.parameters.push(
        new ethereum.EventParam(
            "sender",
            ethereum.Value.fromAddress(dummyAddress)
        )
    )

    event.parameters.push(
        new ethereum.EventParam(
            "input",
            ethereum.Value.fromBytes(Bytes.empty())
        )
    )

    return event
}

export function createApplicationCreatedEvent(
    newTimestamp: BigInt,
    factoryAddress: Address,
    appAddress: Address
): ApplicationCreated {
    let event = changetype<ApplicationCreated>(newMockEvent)
    event.transaction.hash = txHash
    event.block.timestamp = newTimestamp
    event.address = factoryAddress
    event.parameters = new Array()

    // The parameters order in the Array matters. The Event class has named getters but it gets from an internal array.
    event.parameters.push(
        new ethereum.EventParam(
            "consensus",
            ethereum.Value.fromAddress(dummyAddress)
        )
    )

    event.parameters.push(
        new ethereum.EventParam(
            "dappOwner",
            ethereum.Value.fromAddress(dummyAddress)
        )
    )

    event.parameters.push(
        new ethereum.EventParam(
            "templateHash",
            // May want to change that in the future for something else instead of empty
            ethereum.Value.fromBytes(Bytes.empty())
        )
    )

    event.parameters.push(
        new ethereum.EventParam(
            "application",
            ethereum.Value.fromAddress(appAddress)
        )
    )

    return event
}
