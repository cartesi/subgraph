import {
    clearStore,
    test,
    assert,
    newMockEvent,
} from "matchstick-as/assembly/index"

import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { BlockSelectorContext } from "../../generated/schema"

import * as blockSelectorContext from "../../src/blockSelectorContext-2.0"
import * as utils from "../utils"

test("should create new BlockSelectorContext from NewChainV2 event", () => {
    let minimumDifficulty = 123
    let targetInterval = 234
    let difficultyAdjustmentParameter = 345
    let initialDifficulty = 456
    let blockNumber = 1000
    const newChainEvent = utils.createNewChainV2Event(
        BigInt.fromI32(minimumDifficulty),
        BigInt.fromI32(targetInterval),
        BigInt.fromI32(difficultyAdjustmentParameter),
        BigInt.fromI32(initialDifficulty),
        BigInt.fromI32(blockNumber)
    )
    blockSelectorContext.create(newChainEvent, 0)

    assert.fieldEquals(
        "BlockSelectorContext",
        utils.posV2Address,
        "id",
        utils.posV2Address
    )
    assert.fieldEquals(
        "BlockSelectorContext",
        utils.posV2Address,
        "minDifficulty",
        minimumDifficulty.toString()
    )
    assert.fieldEquals(
        "BlockSelectorContext",
        utils.posV2Address,
        "targetInterval",
        targetInterval.toString()
    )
    assert.fieldEquals(
        "BlockSelectorContext",
        utils.posV2Address,
        "difficultyAdjustmentParameter",
        difficultyAdjustmentParameter.toString()
    )
    assert.fieldEquals(
        "BlockSelectorContext",
        utils.posV2Address,
        "difficulty",
        initialDifficulty.toString()
    )
    assert.fieldEquals(
        "BlockSelectorContext",
        utils.posV2Address,
        "ethBlockCheckpoint",
        blockNumber.toString()
    )
})

test("should update context from V2 correctly", () => {
    let blockNum = 90
    let context = BlockSelectorContext.load(utils.posV2Address)!
    context.targetInterval = BigInt.fromI32(100)
    blockSelectorContext.save(utils.posV2Address, context)
    blockSelectorContext.update(
        utils.posV2Address,
        BigInt.fromI32(blockNum),
        BigInt.fromI32(457),
        BigInt.fromI32(999)
    )

    assert.fieldEquals(
        "BlockSelectorContext",
        utils.posV2Address,
        "ethBlockCheckpoint",
        blockNum.toString()
    )
    assert.fieldEquals("BlockSelectorContext", utils.posV2Address, "difficulty", "457")
})
