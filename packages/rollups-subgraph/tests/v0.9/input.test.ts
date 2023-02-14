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
import { assert, beforeEach, describe, test, clearStore } from "matchstick-as"
import { handleInputAdded } from "../../src/handlers/v0.9/input"
import { handleApplicationCreated } from "../../src/handlers/v0.9/dapp"
import { handleApplicationCreated as handleApplicationCreated6 } from "../../src/handlers/v0.6/dapp"
import { handleApplicationCreated as handleApplicationCreated8 } from "../../src/handlers/v0.8/dapp"
import { handleInput } from "../../src/handlers/input"
import {
    createApplicationCreatedEventV06,
    createApplicationCreatedEventV08,
    nextDappAddress,
    nextFactoryAddress,
    txTimestamp,
    createInputAddedEvent as createClassicInputAddedEvent,
} from "../utils"
import { createApplicationCreatedEvent, createInputAddedEvent } from "./utils"

const timestamp = BigInt.fromI32(txTimestamp + 21600) // Thursday, August 26, 2021 11:46:40 PM
const FACTORY_E = "DAppFactory"
const DAPP_E = "DApp"
const DASH_E = "Dashboard"

describe("Input v0.9", () => {
    beforeEach(() => {
        clearStore()
    })

    describe("when handling dapp inputs", () => {
        test("it should update the dapp, factory and dashboard input count correctly", () => {
            let dapp = nextDappAddress()
            let d2 = nextDappAddress()
            let d3 = nextDappAddress()
            let factory = nextFactoryAddress()

            handleApplicationCreated(
                createApplicationCreatedEvent(timestamp, factory, dapp)
            )
            handleApplicationCreated(
                createApplicationCreatedEvent(timestamp, factory, d2)
            )
            handleApplicationCreated(
                createApplicationCreatedEvent(timestamp, factory, d3)
            )

            assert.fieldEquals(DAPP_E, dapp.toHexString(), "inputCount", "0")
            assert.fieldEquals(DAPP_E, d2.toHexString(), "inputCount", "0")
            assert.fieldEquals(DAPP_E, d3.toHexString(), "inputCount", "0")

            handleInputAdded(createInputAddedEvent(timestamp, dapp))
            handleInputAdded(createInputAddedEvent(timestamp, dapp))
            handleInputAdded(createInputAddedEvent(timestamp, d2))
            handleInputAdded(createInputAddedEvent(timestamp, d3))
            handleInputAdded(createInputAddedEvent(timestamp, d2))

            // then
            assert.fieldEquals(DAPP_E, dapp.toHexString(), "inputCount", "2")
            assert.fieldEquals(DAPP_E, d2.toHexString(), "inputCount", "2")
            assert.fieldEquals(DAPP_E, d3.toHexString(), "inputCount", "1")

            assert.fieldEquals(
                FACTORY_E,
                factory.toHexString(),
                "inputCount",
                "5"
            )

            assert.fieldEquals(DASH_E, "1", "inputCount", "5")
        })

        test("it should update the dashboard overall input-count and factories individual input count correctly", () => {
            let dapp = nextDappAddress()
            let dappTwo = nextDappAddress()
            let dappThree = nextFactoryAddress()
            let factory = nextFactoryAddress()
            let factoryTwo = nextFactoryAddress()
            let f3 = nextFactoryAddress()
            let d4 = nextDappAddress()

            handleApplicationCreated6(
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

            handleApplicationCreated(
                createApplicationCreatedEvent(timestamp, f3, d4)
            )

            // when a few classic v0.6 ~ v0.8 InputAdded goes through
            handleInput(createClassicInputAddedEvent(timestamp, dapp))
            handleInput(createClassicInputAddedEvent(timestamp, dapp))
            handleInput(createClassicInputAddedEvent(timestamp, dappTwo))
            handleInput(createClassicInputAddedEvent(timestamp, dappTwo))
            handleInput(createClassicInputAddedEvent(timestamp, dappTwo))
            handleInput(createClassicInputAddedEvent(timestamp, dappTwo))
            handleInput(createClassicInputAddedEvent(timestamp, dappThree))
            // v0.9 input handler
            handleInputAdded(createInputAddedEvent(timestamp, d4))
            handleInputAdded(createInputAddedEvent(timestamp, d4))
            handleInputAdded(createInputAddedEvent(timestamp, d4))
            handleInputAdded(createInputAddedEvent(timestamp, d4))

            // then
            assert.fieldEquals(
                FACTORY_E,
                factory.toHexString(),
                "inputCount",
                "2"
            )
            assert.fieldEquals(
                FACTORY_E,
                factoryTwo.toHexString(),
                "inputCount",
                "5"
            )

            assert.fieldEquals(FACTORY_E, f3.toHexString(), "inputCount", "4")

            assert.fieldEquals(DASH_E, "1", "inputCount", "11")
        })
    })
})
