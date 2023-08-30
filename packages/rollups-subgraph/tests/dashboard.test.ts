// Copyright 2023 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { BigInt } from "@graphprotocol/graph-ts"
import { describe, test, assert, clearStore, beforeEach } from "matchstick-as"
import { DApp, DAppFactory } from "../generated/schema"
import { nextDappAddress, nextFactoryAddress, txTimestamp } from "./utils"
import {
    createApplicationCreatedEvent,
    createInputAddedEvent,
} from "./v1.0/utils"
import { handleApplicationCreated } from "../src/handlers/dapp"
import { handleInputAdded } from "../src/handlers/input"

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
                createApplicationCreatedEvent(timestamp, factoryOne, dappOne)
            )
            handleApplicationCreated(
                createApplicationCreatedEvent(timestamp, factoryTwo, dappTwo)
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
                createApplicationCreatedEvent(timestamp, factory, dapp)
            )

            handleApplicationCreated(
                createApplicationCreatedEvent(timestamp, factoryTwo, dappTwo)
            )

            handleInputAdded(createInputAddedEvent(timestamp, dapp))
            handleInputAdded(createInputAddedEvent(timestamp, dapp))
            handleInputAdded(createInputAddedEvent(timestamp, dappTwo))

            assert.fieldEquals(DASH_E, DASH_ID, "inputCount", "3")
        })
    })
})
