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
import { describe, test, clearStore, beforeEach, assert } from "matchstick-as"
import { handleInput } from "../src/handlers/input"
import { handleApplicationCreated } from "../src/handlers/v0.6/dapp"
import { handleApplicationCreated as handleApplicationCreated8 } from "../src/handlers/v0.8/dapp"
import {
    createApplicationCreatedEventV06,
    createApplicationCreatedEventV08,
    createInputAddedEvent,
    nextDappAddress,
    nextFactoryAddress,
    txTimestamp,
} from "./utils"

const timestamp = BigInt.fromI32(txTimestamp + 21600) // Thursday, August 26, 2021 11:46:40 PM
const FACTORY_E = "DAppFactory"
const DAPP_E = "DApp"
const DASH_E = "Dashboard"

describe("Input", () => {
    beforeEach(() => {
        clearStore()
    })

    describe("when handling dapp inputs", () => {
        test("it should update the dapp input count correctly", () => {
            let dapp = nextDappAddress()
            let factory = nextFactoryAddress()

            handleApplicationCreated(
                createApplicationCreatedEventV06(timestamp, factory, dapp)
            )

            // check the Dapp input count after creation
            assert.fieldEquals(DAPP_E, dapp.toHexString(), "inputCount", "0")

            // when input-added happen
            handleInput(createInputAddedEvent(timestamp, dapp))

            // then
            assert.fieldEquals(DAPP_E, dapp.toHexString(), "inputCount", "1")
        })

        test("it should update the factory input count correctly", () => {
            let dapp = nextDappAddress()
            let dappTwo = nextDappAddress()
            let factory = nextFactoryAddress()

            handleApplicationCreated(
                createApplicationCreatedEventV06(timestamp, factory, dapp)
            )

            handleApplicationCreated(
                createApplicationCreatedEventV06(timestamp, factory, dappTwo)
            )

            const id = factory.toHexString()

            // check the Factory input count after creation
            assert.fieldEquals(FACTORY_E, id, "inputCount", "0")

            // when input-added happen
            handleInput(createInputAddedEvent(timestamp, dapp))
            handleInput(createInputAddedEvent(timestamp, dappTwo))
            handleInput(createInputAddedEvent(timestamp, dappTwo))

            // then
            assert.fieldEquals(FACTORY_E, id, "inputCount", "3")
        })

        test("it should update the dashboard overall input-count and factories individual input count correctly", () => {
            let dapp = nextDappAddress()
            let dappTwo = nextDappAddress()
            let dappThree = nextFactoryAddress()
            let factory = nextFactoryAddress()
            let factoryTwo = nextFactoryAddress()

            handleApplicationCreated(
                createApplicationCreatedEventV06(timestamp, factory, dapp)
            )

            handleApplicationCreated8(
                createApplicationCreatedEventV08(timestamp, factoryTwo, dappTwo)
            )

            handleApplicationCreated8(
                createApplicationCreatedEventV08(
                    timestamp,
                    factoryTwo,
                    dappThree
                )
            )

            const idOne = factory.toHexString()
            const fIdTwo = factoryTwo.toHexString()
            const dIdOne = dapp.toHexString()
            const dIdTwo = dappTwo.toHexString()
            const dIdThree = dappThree.toHexString()
            // check the Factories and Dapps input count after creation
            assert.fieldEquals(FACTORY_E, idOne, "inputCount", "0")
            assert.fieldEquals(FACTORY_E, fIdTwo, "inputCount", "0")
            assert.fieldEquals(DAPP_E, dIdOne, "inputCount", "0")
            assert.fieldEquals(DAPP_E, dIdTwo, "inputCount", "0")
            assert.fieldEquals(DAPP_E, dIdThree, "inputCount", "0")

            // when a few InputAdded goes through
            handleInput(createInputAddedEvent(timestamp, dapp))
            handleInput(createInputAddedEvent(timestamp, dapp))
            handleInput(createInputAddedEvent(timestamp, dappTwo))
            handleInput(createInputAddedEvent(timestamp, dappTwo))
            handleInput(createInputAddedEvent(timestamp, dappTwo))
            handleInput(createInputAddedEvent(timestamp, dappTwo))
            handleInput(createInputAddedEvent(timestamp, dappThree))

            // then
            assert.fieldEquals(FACTORY_E, idOne, "inputCount", "2")
            assert.fieldEquals(FACTORY_E, fIdTwo, "inputCount", "5")
            assert.fieldEquals(DASH_E, "1", "inputCount", "7")
        })
    })
})
