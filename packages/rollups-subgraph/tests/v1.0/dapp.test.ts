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
import { handleApplicationCreated } from "../../src/handlers/dapp"
import { handleInputAdded } from "../../src/handlers/input"
import { nextDappAddress, nextFactoryAddress, txTimestamp } from "../utils"
import { createApplicationCreatedEvent, createInputAddedEvent } from "./utils"
import { DAppStatus } from "../../src/handlers/DAppStatus"

const DAPP_E = "DApp"
const FACTORY_E = "DAppFactory"
const DASH_E = "Dashboard"
const DASH_ID = "1"

describe("Dapp v1.0", () => {
    beforeEach(() => {
        clearStore()
    })

    describe("when ApplicationCreated event is emitted", () => {
        test("it should create the factory and dapp with correct properties", () => {
            let timestamp = BigInt.fromI32(txTimestamp)
            let dapp = nextDappAddress()
            let factory = nextFactoryAddress()

            handleApplicationCreated(
                createApplicationCreatedEvent(timestamp, factory, dapp)
            )

            const factoryId = factory.toHexString()
            const dappId = dapp.toHexString()

            assert.fieldEquals(FACTORY_E, factoryId, "version", "1.0")

            assert.fieldEquals(FACTORY_E, factoryId, "dappCount", "1")

            assert.fieldEquals(DAPP_E, dappId, "inputDuration", "0")
            assert.fieldEquals(DAPP_E, dappId, "challengePeriod", "0")
            assert.fieldEquals(DAPP_E, dappId, "currentEpoch", "0")
            assert.fieldEquals(DAPP_E, dappId, "inputCount", "0")
            assert.fieldEquals(
                DAPP_E,
                dappId,
                "deploymentTimestamp",
                "1630000000"
            )
            assert.fieldEquals(
                DAPP_E,
                dappId,
                "activityTimestamp",
                "1630000000"
            )
            assert.fieldEquals(DAPP_E, dappId, "factory", factoryId)
        })

        test("it should update dashboard and factory overall dapp count number", () => {
            let timestamp = BigInt.fromI32(txTimestamp)
            let d1 = nextDappAddress()
            let d2 = nextDappAddress()
            let d3 = nextDappAddress()
            let factory = nextFactoryAddress()

            handleApplicationCreated(
                createApplicationCreatedEvent(timestamp, factory, d1)
            )

            handleApplicationCreated(
                createApplicationCreatedEvent(timestamp, factory, d2)
            )

            handleApplicationCreated(
                createApplicationCreatedEvent(timestamp, factory, d3)
            )

            const DASH = "Dashboard"
            const DASH_ID = "1"

            assert.fieldEquals(DASH, DASH_ID, "factoryCount", "1")
            assert.fieldEquals(DASH, DASH_ID, "dappCount", "3")

            assert.fieldEquals(
                FACTORY_E,
                factory.toHexString(),
                "dappCount",
                "3"
            )
        })

        test("it should have the correct status when creating a new DApp", () => {
            let timestamp = BigInt.fromI32(txTimestamp)
            let d1 = nextDappAddress()
            let factory = nextFactoryAddress()

            handleApplicationCreated(
                createApplicationCreatedEvent(timestamp, factory, d1)
            )

            const DASH = "Dashboard"
            const DASH_ID = "1"

            assert.fieldEquals(DASH, DASH_ID, "factoryCount", "1")
            assert.fieldEquals(DASH, DASH_ID, "dappCount", "1")

            assert.fieldEquals(
                DAPP_E,
                d1.toHexString(),
                "status",
                DAppStatus.CREATED_BY_FACTORY
            )
        })

        test("it should update DApp status, factory and overall counters when a posterior creation happens", () => {
            let dapp = nextDappAddress()
            let timestamp = BigInt.fromI32(txTimestamp)

            // InputAdded for a DApp that does not exist yet.
            handleInputAdded(createInputAddedEvent(timestamp, dapp))

            assert.fieldEquals(
                DAPP_E,
                dapp.toHex(),
                "status",
                DAppStatus.CREATED_BY_INPUT_EVT
            )

            assert.fieldEquals(
                DAPP_E,
                dapp.toHex(),
                "factory",
                "virtual_factory"
            )

            assert.fieldEquals(DAPP_E, dapp.toHex(), "inputCount", "1")

            let factory = nextFactoryAddress()

            // Then the creation event is handled
            handleApplicationCreated(
                createApplicationCreatedEvent(
                    BigInt.fromI32(txTimestamp + 21600),
                    factory,
                    dapp
                )
            )

            assert.fieldEquals(
                DAPP_E,
                dapp.toHex(),
                "status",
                DAppStatus.CREATED_BY_FACTORY
            )

            assert.fieldEquals(DAPP_E, dapp.toHex(), "factory", factory.toHex())

            assert.fieldEquals(FACTORY_E, factory.toHex(), "inputCount", "1")
            assert.fieldEquals(FACTORY_E, factory.toHex(), "dappCount", "1")

            assert.fieldEquals(DASH_E, DASH_ID, "inputCount", "1")
            assert.fieldEquals(DASH_E, DASH_ID, "dappCount", "1")
        })
    })
})
