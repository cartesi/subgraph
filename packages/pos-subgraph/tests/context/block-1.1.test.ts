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
} from "matchstick-as/assembly/index"

import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { BlockSelectorContext } from "../../generated/schema"

import * as blockSelectorContext from "../../src/blockSelectorContext-1.1"
import * as utils from "../utils"

let ONE = BigInt.fromI32(1)

let hash1 = "0xf81b517a242b218999ec8eec0ea6e2ddbef2a367a14e93f4a32a39e260f686ad"
let hash2 = "0x428c8c24c33c0c48602c97a880cb4bd28ea64299c0384c88fd3839f8325a1729"
let id0 = utils.zeroID()

describe("BlockSelectorContext", () => {
    test("should create new BlockSelectorContext from NewChain event", () => {
        let minimumDifficulty = 123
        let targetInterval = 234
        let difficultyAdjustmentParameter = 345
        let initialDifficulty = 456
        let blockNumber = 1000
        const newChainEvent = utils.createNewChainEvent(
            BigInt.fromI32(minimumDifficulty),
            BigInt.fromI32(targetInterval),
            BigInt.fromI32(difficultyAdjustmentParameter),
            BigInt.fromI32(initialDifficulty),
            BigInt.fromI32(blockNumber)
        )
        blockSelectorContext.create(newChainEvent)

        assert.fieldEquals("BlockSelectorContext", id0, "id", id0)
        assert.fieldEquals(
            "BlockSelectorContext",
            id0,
            "minDifficulty",
            minimumDifficulty.toString()
        )
        assert.fieldEquals(
            "BlockSelectorContext",
            id0,
            "targetInterval",
            targetInterval.toString()
        )
        assert.fieldEquals(
            "BlockSelectorContext",
            id0,
            "difficultyAdjustmentParameter",
            difficultyAdjustmentParameter.toString()
        )
        assert.fieldEquals(
            "BlockSelectorContext",
            id0,
            "difficulty",
            initialDifficulty.toString()
        )
        assert.fieldEquals(
            "BlockSelectorContext",
            id0,
            "ethBlockCheckpoint",
            blockNumber.toString()
        )
    })

    test("should update context correctly", () => {
        let blockNum = 90
        let context = BlockSelectorContext.load(id0)!
        context.targetInterval = BigInt.fromI32(100)
        blockSelectorContext.save(id0, context)
        blockSelectorContext.update(id0, BigInt.fromI32(blockNum))

        assert.fieldEquals(
            "BlockSelectorContext",
            id0,
            "ethBlockCheckpoint",
            blockNum.toString()
        )
        assert.fieldEquals("BlockSelectorContext", id0, "difficulty", "457")
    })

    test("should update context difficulty to minimum", () => {
        clearStore()
        let blockNum = 120
        let minDifficulty = BigInt.fromI32(10)
        let context = utils.zeroedNewBlockSelectorContext()
        context.targetInterval = BigInt.fromI32(100)
        context.difficulty = BigInt.fromI32(1)
        context.minDifficulty = minDifficulty
        blockSelectorContext.save(id0, context)

        blockSelectorContext.update(id0, BigInt.fromI32(blockNum))
        assert.fieldEquals(
            "BlockSelectorContext",
            id0,
            "difficulty",
            minDifficulty.toString()
        )
    })

    test("should update context difficulty to new diff", () => {
        clearStore()
        let blockNum = 120
        let minDifficulty = BigInt.fromI32(10)
        let difficulty = BigInt.fromI32(20)
        let context = utils.zeroedNewBlockSelectorContext()
        context.targetInterval = BigInt.fromI32(100)
        context.difficulty = difficulty
        context.minDifficulty = minDifficulty
        blockSelectorContext.save(id0, context)

        blockSelectorContext.update(id0, BigInt.fromI32(blockNum))
        assert.fieldEquals(
            "BlockSelectorContext",
            id0,
            "difficulty",
            difficulty.minus(ONE).toString()
        )
    })
})
