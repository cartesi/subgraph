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
import { describe, test, clearStore, beforeEach, assert } from "matchstick-as"
import { handleApplicationCreated } from "../../src/handlers/v0.6/dapp"
import { createApplicationCreatedEventV06, txTimestamp } from "../utils"

describe("Dapp v0.6", () => {
    describe("On application-created Event", () => {
        beforeEach(() => {
            clearStore()
        })

        test("should create factory and dapp after handling event", () => {
            const timestamp = BigInt.fromI32(txTimestamp + 21600) // Thursday, August 26, 2021 11:46:40 PM
            const appAddress = Address.fromString(
                "0x0000000000000000000000000000000000000100"
            )
            const factoryAddress = Address.fromString(
                "0x0000000000000000000000000000000000000200"
            )

            const event = createApplicationCreatedEventV06(
                timestamp,
                factoryAddress,
                appAddress
            )

            handleApplicationCreated(event)

            assert.fieldEquals(
                "DAppFactory",
                factoryAddress.toHexString(),
                "dappCount",
                "1"
            )
            assert.fieldEquals(
                "DAppFactory",
                factoryAddress.toHexString(),
                "inputCount",
                "0"
            )

            assert.fieldEquals(
                "DAppFactory",
                factoryAddress.toHexString(),
                "version",
                "0.6"
            )

            assert.fieldEquals(
                "DApp",
                appAddress.toHexString(),
                "inputCount",
                "0"
            )

            assert.fieldEquals(
                "DApp",
                appAddress.toHexString(),
                "inputDuration",
                "86400"
            )

            assert.fieldEquals(
                "DApp",
                appAddress.toHexString(),
                "challengePeriod",
                "604800"
            )

            assert.fieldEquals(
                "DApp",
                appAddress.toHexString(),
                "currentEpoch",
                "0"
            )

            assert.fieldEquals(
                "DApp",
                appAddress.toHexString(),
                "deploymentTimestamp",
                "1630021600"
            )

            assert.fieldEquals(
                "DApp",
                appAddress.toHexString(),
                "activityTimestamp",
                "1630021600"
            )
        })

        test("should update dashboard with overall status about factories and dapps", () => {
            const timestamp = BigInt.fromI32(txTimestamp + 21600) // Thursday, August 26, 2021 11:46:40 PM
            const appAddressOne = Address.fromString(
                "0x0000000000000000000000000000000000000100"
            )

            const appAddressTwo = Address.fromString(
                "0x0000000000000000000000000000000000000101"
            )
            const factoryAddress = Address.fromString(
                "0x0000000000000000000000000000000000000200"
            )

            let evt = createApplicationCreatedEventV06(
                timestamp,
                factoryAddress,
                appAddressOne
            )

            handleApplicationCreated(evt)

            assert.fieldEquals("Dashboard", "1", "factoryCount", "1")

            assert.fieldEquals("Dashboard", "1", "dappCount", "1")

            assert.fieldEquals("Dashboard", "1", "inputCount", "0")

            let eventTwo = createApplicationCreatedEventV06(
                timestamp,
                factoryAddress,
                appAddressTwo
            )

            handleApplicationCreated(eventTwo)

            assert.fieldEquals("Dashboard", "1", "factoryCount", "1")
            assert.fieldEquals("Dashboard", "1", "dappCount", "2")
            assert.fieldEquals("Dashboard", "1", "inputCount", "0")
        })
    })
})
