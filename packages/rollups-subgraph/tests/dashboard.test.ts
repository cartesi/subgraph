// Copyright 2023 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { Address, BigInt } from "@graphprotocol/graph-ts"
import { describe, test, assert, clearStore, beforeEach } from "matchstick-as"
import { DApp, DAppFactory } from "../generated/schema"
import { handleInput } from "../src/handlers/input"
import { handleApplicationCreated } from "../src/handlers/v0.6/dapp"
import { handleApplicationCreated as handleApplicationCreated8 } from "../src/handlers/v0.8/dapp"
import {
    createApplicationCreatedEventV06,
    createApplicationCreatedEventV08,
    createInputAddedEvent,
    txTimestamp,
} from "./utils"

let factoryNumber = 100
let dappNumber = 200

function nextDappAddress(): Address {
    const address = Address.fromString(
        "0x0000000000000000000000000000000000000" + dappNumber.toString()
    )
    dappNumber++
    return address
}

function nextFactoryAddress(): Address {
    const address = Address.fromString(
        "0x0000000000000000000000000000000000000" + factoryNumber.toString()
    )

    factoryNumber++
    return address
}

const DASH_E = "Dashboard"
const DASH_ID = "1"

describe("Dashboard", () => {
    beforeEach(() => {
        clearStore()
    })

    describe("when multiple factories spawn DApps", () => {
        test("it should have the overall number of factories and dapps set correctly", () => {
            const timestamp = BigInt.fromI32(txTimestamp + 21600) // Thursday, August 26, 2021 11:46:40 PM
            const dappOne = nextDappAddress()
            const dappTwo = nextDappAddress()
            const factoryOne = nextFactoryAddress()
            const factoryTwo = nextFactoryAddress()

            handleApplicationCreated(
                createApplicationCreatedEventV06(timestamp, factoryOne, dappOne)
            )
            handleApplicationCreated8(
                createApplicationCreatedEventV08(timestamp, factoryTwo, dappTwo)
            )

            assert.fieldEquals(DASH_E, DASH_ID, "factoryCount", "2")
            assert.fieldEquals(DASH_E, DASH_ID, "dappCount", "2")
            assert.fieldEquals(DASH_E, DASH_ID, "inputCount", "0")

            assert.assertNotNull(DAppFactory.load(factoryOne.toHexString()))
            assert.assertNotNull(DAppFactory.load(factoryTwo.toHexString()))
            assert.assertNotNull(DApp.load(dappOne.toHexString()))
            assert.assertNotNull(DApp.load(dappTwo.toHexString()))
        })
    })

    describe("when handling multiple dapp inputs", () => {
        test("it should register the overall number of inputs correctly", () => {
            const timestamp = BigInt.fromI32(txTimestamp + 21600) // Thursday, August 26, 2021 11:46:40 PM
            const dapp = nextDappAddress()
            const dappTwo = nextDappAddress()
            const factory = nextFactoryAddress()
            const factoryTwo = nextFactoryAddress()

            handleApplicationCreated(
                createApplicationCreatedEventV06(timestamp, factory, dapp)
            )

            handleApplicationCreated8(
                createApplicationCreatedEventV08(timestamp, factoryTwo, dappTwo)
            )

            handleInput(createInputAddedEvent(timestamp, dapp))
            handleInput(createInputAddedEvent(timestamp, dapp))
            handleInput(createInputAddedEvent(timestamp, dappTwo))

            assert.fieldEquals(DASH_E, DASH_ID, "inputCount", "3")
        })
    })
})
