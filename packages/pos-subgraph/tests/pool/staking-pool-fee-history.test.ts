// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { assert, clearStore, describe, afterEach, test } from "matchstick-as"
import { generateId, StakingPoolFeeType } from "../../src/StakingPoolFeeHistory"
import { StakingPoolFee } from "../../generated/schema"
import { handleFlatRateChanged } from "../../src/fee"
import {
    buildStakingPoolFee,
    createFlatRateChangedEvent,
    txTimestamp,
} from "../utils"

let ENTITY_NAME = "StakingPoolFeeHistory"
const fee = Address.fromString("0x0000000000000000000000000000000000000000")
const pool = Address.fromString("0x0000000000000000000000000000000000000001")

function createStakingPoolFee(): StakingPoolFee {
    let timestamp = BigInt.fromI32(txTimestamp)
    let stakingPoolFee = buildStakingPoolFee(fee, pool, timestamp)
    stakingPoolFee.save()
    return stakingPoolFee
}

describe("Staking pool fee historic data", () => {
    afterEach(() => {
        clearStore()
    })

    describe("For Flat Rate Commission", () => {
        test("should create the correct historic entry when handling the event for the first time", () => {
            // create a StakingPoolFee Entry
            createStakingPoolFee()

            // then generate an flat-rate-changed-event to the same address
            // 5%
            const newRate = BigInt.fromI32(500)
            const newTimestamp = BigInt.fromI32(txTimestamp + 300)
            const event = createFlatRateChangedEvent(fee, newRate, newTimestamp)

            handleFlatRateChanged(event)

            const entryId = generateId(event.transaction.hash, fee)

            assert.fieldEquals(
                ENTITY_NAME,
                entryId,
                "newValue",
                newRate.toString()
            )

            assert.fieldEquals(ENTITY_NAME, entryId, "change", "0")

            assert.fieldEquals(ENTITY_NAME, entryId, "pool", pool.toHex())

            assert.fieldEquals(
                ENTITY_NAME,
                entryId,
                "newValue",
                newRate.toString()
            )

            assert.fieldEquals(
                ENTITY_NAME,
                entryId,
                "feeType",
                StakingPoolFeeType.FLAT_RATE_COMMISSION
            )
        })

        test("Should have a change property filled when the second event is handled in", () => {
            createStakingPoolFee()
            // 5% commission
            const rate = BigInt.fromI32(500)
            const timestamp = BigInt.fromI32(txTimestamp)
            const event = createFlatRateChangedEvent(fee, rate, timestamp)
            handleFlatRateChanged(event)

            // five minutes later the rate is changed to 3%
            const nextEvent = createFlatRateChangedEvent(
                fee,
                BigInt.fromI32(300),
                BigInt.fromI32(txTimestamp + 300)
            )
            const newHash = Bytes.fromHexString(
                "0x0000000000000000000000000000000000000000000000000000000000000002"
            )
            nextEvent.transaction.hash = newHash
            handleFlatRateChanged(nextEvent)

            const firstEntryId = generateId(event.transaction.hash, fee)
            const latestId = generateId(newHash, fee)

            assert.fieldEquals(ENTITY_NAME, firstEntryId, "change", "0")

            assert.fieldEquals(ENTITY_NAME, latestId, "change", "-200")

            assert.fieldEquals(ENTITY_NAME, latestId, "newValue", "300")
            assert.fieldEquals(
                ENTITY_NAME,
                latestId,
                "feeType",
                "FLAT_RATE_COMMISSION"
            )
            assert.fieldEquals(ENTITY_NAME, latestId, "pool", pool.toHex())
        })
    })
})
