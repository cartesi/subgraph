// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import {
    clearStore,
    test,
    assert,
    describe,
    beforeEach,
} from "matchstick-as/assembly/index"

import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"

import * as blockSelectorContext from "../../src/blockSelectorContext-1.0"
import { cachedStore, save } from "../../src/blockSelectorContext"
import * as utils from "../utils"

let ONE = BigInt.fromI32(1)

let id0 = utils.zeroID()
let mainnetBlockSelectorAddr = "0x742fcF5Ba052D9912499aCf208d5410AE31d49Ac"
let firstChainBlockNum = BigInt.fromI32(11499137)
let secondChainBlockNum = BigInt.fromI32(11552592)

function clearAllStores(): void {
    clearStore()
    cachedStore.clear()
}

describe("BlockSelectorContext v.1.0", () => {
    beforeEach(() => {
        clearAllStores()
    })

    test("should create a new BlockSelectorContext on exact blocks chain0", () => {
        let targetInterval = 100
        let producer = "0x00000000000000000000000000000000000d2ce3"

        let blockProducedEvent = utils.createNewBlockProducedV1Event(
            0,
            targetInterval,
            mainnetBlockSelectorAddr,
            producer,
            firstChainBlockNum
        )
        blockSelectorContext.createFromBlockProduced(blockProducedEvent)
        let id = blockSelectorContext.contextID(
            Address.fromString(mainnetBlockSelectorAddr),
            BigInt.fromI32(0)
        )
        assert.fieldEquals("BlockSelectorContext", id, "id", id)
        assert.fieldEquals(
            "BlockSelectorContext",
            id,
            "minDifficulty",
            "1000000000"
        )
        assert.fieldEquals(
            "BlockSelectorContext",
            id,
            "difficultyAdjustmentParameter",
            "50000"
        )
        assert.fieldEquals(
            "BlockSelectorContext",
            id,
            "difficulty",
            "18000000000000000000000000"
        )
        assert.fieldEquals(
            "BlockSelectorContext",
            id,
            "targetInterval",
            targetInterval.toString()
        )
        assert.fieldEquals(
            "BlockSelectorContext",
            id,
            "ethBlockCheckpoint",
            firstChainBlockNum.toString()
        )
    })

    test("should update context correctly", () => {
        let minDifficulty = BigInt.fromI32(10)
        let context = utils.zeroedNewBlockSelectorContext()
        context.targetInterval = BigInt.fromI32(100)
        context.difficulty = BigInt.fromI32(1)
        context.minDifficulty = minDifficulty
        save(id0, context)

        let blockNum = 90
        blockSelectorContext.update(
            id0,
            BigInt.fromI32(blockNum),
            BigInt.fromI32(blockNum * 100)
        )

        assert.fieldEquals(
            "BlockSelectorContext",
            id0,
            "ethBlockCheckpoint",
            (blockNum + 1).toString()
        )
        assert.fieldEquals("BlockSelectorContext", id0, "difficulty", "10")
        assert.fieldEquals(
            "BlockSelectorContext",
            id0,
            "lastBlockTimestamp",
            (blockNum * 100).toString()
        )
    })

    test("should create a new BlockSelectorContext on exact blocks chain1", () => {
        let targetInterval = 100
        let producer = "0x00000000000000000000000000000000000d2ce3"

        let blockProducedEvent = utils.createNewBlockProducedV1Event(
            1,
            targetInterval,
            mainnetBlockSelectorAddr,
            producer,
            secondChainBlockNum
        )
        blockSelectorContext.createFromBlockProduced(blockProducedEvent)
        let id = blockSelectorContext.contextID(
            Address.fromString(mainnetBlockSelectorAddr),
            BigInt.fromI32(1)
        )
        assert.fieldEquals("BlockSelectorContext", id, "id", id)
        assert.fieldEquals(
            "BlockSelectorContext",
            id,
            "minDifficulty",
            "1000000000"
        )
        assert.fieldEquals(
            "BlockSelectorContext",
            id,
            "difficultyAdjustmentParameter",
            "50000"
        )
        assert.fieldEquals(
            "BlockSelectorContext",
            id,
            "difficulty",
            "9000000000000000000000000000"
        )
        assert.fieldEquals(
            "BlockSelectorContext",
            id,
            "targetInterval",
            targetInterval.toString()
        )
        assert.fieldEquals(
            "BlockSelectorContext",
            id,
            "ethBlockCheckpoint",
            secondChainBlockNum.toString()
        )
    })

    test("should not create a new BlockSelectorContext on any other block", () => {
        let targetInterval = 100
        let producer = "0x00000000000000000000000000000000000d2ce3"

        let blockProducedEvent = utils.createNewBlockProducedV1Event(
            1,
            targetInterval,
            mainnetBlockSelectorAddr,
            producer,
            BigInt.fromI32(0)
        )
        blockSelectorContext.createFromBlockProduced(blockProducedEvent)
        let id = blockSelectorContext.contextID(
            Address.fromString(mainnetBlockSelectorAddr),
            BigInt.fromI32(1)
        )
        assert.notInStore("BlockSelectorContext", id)
        assert.equals(
            ethereum.Value.fromI32(cachedStore.size),
            ethereum.Value.fromI32(0)
        )
    })

    test("should update context difficulty to minimum", () => {
        let blockNum = 120
        let minDifficulty = BigInt.fromI32(10)
        let context = utils.zeroedNewBlockSelectorContext()
        context.targetInterval = BigInt.fromI32(100)
        context.difficulty = BigInt.fromI32(1)
        context.minDifficulty = minDifficulty
        save(id0, context)

        blockSelectorContext.update(
            id0,
            BigInt.fromI32(blockNum),
            BigInt.fromI32(blockNum * 100)
        )
        assert.fieldEquals(
            "BlockSelectorContext",
            id0,
            "difficulty",
            minDifficulty.toString()
        )
    })

    test("should update context difficulty to new diff", () => {
        let blockNum = 120
        let minDifficulty = BigInt.fromI32(10)
        let difficulty = BigInt.fromI32(20)
        let context = utils.zeroedNewBlockSelectorContext()
        context.targetInterval = BigInt.fromI32(100)
        context.difficulty = difficulty
        context.minDifficulty = minDifficulty
        save(id0, context)

        blockSelectorContext.update(
            id0,
            BigInt.fromI32(blockNum),
            BigInt.fromI32(blockNum * 100)
        )
        assert.fieldEquals(
            "BlockSelectorContext",
            id0,
            "difficulty",
            difficulty.minus(ONE).toString()
        )
    })
})
