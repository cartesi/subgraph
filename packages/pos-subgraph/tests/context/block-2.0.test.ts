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

let defaultId = "0xA16081F360e3847006dB660bae1c6d1b2e17eC2A" // default address from mockEvent

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
        defaultId,
        "id",
        newChainEvent.address.toHex()
    )
    assert.fieldEquals(
        "BlockSelectorContext",
        defaultId,
        "minDifficulty",
        minimumDifficulty.toString()
    )
    assert.fieldEquals(
        "BlockSelectorContext",
        defaultId,
        "targetInterval",
        targetInterval.toString()
    )
    assert.fieldEquals(
        "BlockSelectorContext",
        defaultId,
        "difficultyAdjustmentParameter",
        difficultyAdjustmentParameter.toString()
    )
    assert.fieldEquals(
        "BlockSelectorContext",
        defaultId,
        "difficulty",
        initialDifficulty.toString()
    )
    assert.fieldEquals(
        "BlockSelectorContext",
        defaultId,
        "ethBlockCheckpoint",
        blockNumber.toString()
    )
})

test("should update context from V2 correctly", () => {
    let blockNum = 90
    let context = BlockSelectorContext.load(defaultId)!
    context.targetInterval = BigInt.fromI32(100)
    blockSelectorContext.save(defaultId, context)
    blockSelectorContext.update(
        defaultId,
        BigInt.fromI32(blockNum),
        BigInt.fromI32(457),
        BigInt.fromI32(999)
    )

    assert.fieldEquals(
        "BlockSelectorContext",
        defaultId,
        "ethBlockCheckpoint",
        blockNum.toString()
    )
    assert.fieldEquals("BlockSelectorContext", defaultId, "difficulty", "457")
})
