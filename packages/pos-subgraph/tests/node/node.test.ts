// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { Address, BigInt, store } from "@graphprotocol/graph-ts"
import {
    assert,
    clearStore,
    describe,
    afterEach,
    test,
    logStore,
} from "matchstick-as"
import { handleJobRejected, handleRetired } from "../../src/node"
import { txTimestamp } from "../utils"
import { createJobRejectedEvent, createNode, createRetiredEvent } from "./utils"

const ENTITY_NAME = "Node"
const user = Address.fromString("0x0000000000000000000000000000000000000000")
const worker = Address.fromString("0x0000000000000000000000000000000000000001")

describe("Node", () => {
    afterEach(() => {
        clearStore()
    })

    describe("event handling", () => {
        test("Should on retired-event update the status and set the retirement-timestamp field", () => {
            const timestamp = BigInt.fromI32(txTimestamp)
            createNode(user, worker, timestamp)
            const retirementTimestamp = BigInt.fromI32(txTimestamp + 300) // five minutes later
            const evt = createRetiredEvent(user, worker, retirementTimestamp)

            handleRetired(evt)

            assert.fieldEquals(ENTITY_NAME, worker.toHex(), "status", "Retired")

            assert.fieldEquals(
                ENTITY_NAME,
                worker.toHex(),
                "retirementTimestamp",
                retirementTimestamp.toString()
            )
        })

        test("Should on job-rejected set the status to Available", () => {
            const timestamp = BigInt.fromI32(txTimestamp)
            createNode(user, worker, timestamp)
            const newTimestamp = BigInt.fromI32(txTimestamp + 300)
            const evt = createJobRejectedEvent(user, worker, newTimestamp)

            handleJobRejected(evt)

            assert.fieldEquals(
                ENTITY_NAME,
                worker.toHex(),
                "status",
                "Available"
            )
        })
    })
})
