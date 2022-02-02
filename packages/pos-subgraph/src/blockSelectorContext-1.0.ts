/**
 *  This module will handle the differences when collecting information
 *  about BlockSelector.sol in its first version.
 */
import { BigInt, dataSource } from "@graphprotocol/graph-ts"
import { BlockProduced } from "../generated/BlockSelector-1.0/BlockSelector"
import { BlockSelectorContext } from "../generated/schema"
import {
    ONE,
    load,
    save,
    contextID,
    ADJUSTMENT_BASE,
} from "./blockSelectorContext"

export { contextID } from "./blockSelectorContext"

export let ID0 = "0x742fcf5ba052d9912499acf208d5410ae31d49ac-0"
export let ID1 = "0x742fcf5ba052d9912499acf208d5410ae31d49ac-1"

export function createFromBlockProduced(event: BlockProduced): void {
    let id = contextID(event.address, event.params.index)

    let context = new BlockSelectorContext(id)
    if (event.block.number == BigInt.fromI32(11499137)) {
        // tx 0x76edb13e2965802565a35ee923567838e80d191c90ff41f45bb3f9342da88a02
        context.minDifficulty = BigInt.fromI32(1000000000)

        context.difficultyAdjustmentParameter = BigInt.fromI32(50000)

        context.difficulty = BigInt.fromString("18000000000000000000000000")
    } else if (event.block.number == BigInt.fromI32(11552592)) {
        // tx 0x1c45ef587d341842658d071f31a496034fd750d66c0dd0216a6959d68e729a17
        context.minDifficulty = BigInt.fromI32(1000000000)
        context.difficultyAdjustmentParameter = BigInt.fromI32(50000)
        context.difficulty = BigInt.fromString("9000000000000000000000000000")
    } else {
        return
    }

    context.targetInterval = event.params.targetInterval
    context.ethBlockCheckpoint = event.block.number
    save(id, context)
}
/// @notice Calculates new difficulty parameter
/// @param _minDiff minimum difficulty of instance
/// @param _oldDiff is the difficulty of previous round
/// @param _blocksPassed how many ethereum blocks have passed
/// @param _targetInterval is how long a round is supposed to take
/// @param _adjustmentParam is how fast the difficulty gets adjusted,
///         should be number * 1000000
export function getNewDifficulty(
    _minDiff: BigInt,
    _oldDiff: BigInt,
    _timePassed: BigInt,
    _targetInterval: BigInt,
    _adjustmentParam: BigInt
): BigInt {
    // @dev to save gas on evaluation, instead of returning the _oldDiff when the target
    // was exactly matched - we increase the difficulty.
    if (_timePassed.lt(_targetInterval)) {
        return _oldDiff.plus(
            _oldDiff.times(_adjustmentParam).div(ADJUSTMENT_BASE).plus(ONE)
        )
    } else if (_timePassed.gt(_targetInterval)) {
        let newDiff: BigInt = _oldDiff.minus(
            _oldDiff.times(_adjustmentParam).div(ADJUSTMENT_BASE).plus(ONE)
        )
        return newDiff.gt(_minDiff) ? newDiff : _minDiff
    }
    return _oldDiff
}

export function update(
    id: string,
    blockNumber: BigInt,
    blockTimeStamp: BigInt
): void {
    let context = load(id)
    if (context == null) return // don't run before instantiation of the chain
    context.difficulty = getNewDifficulty(
        context.minDifficulty,
        context.difficulty,
        blockTimeStamp.minus(context.lastBlockTimestamp),
        context.targetInterval,
        context.difficultyAdjustmentParameter
    )
    context.lastBlockTimestamp = blockTimeStamp
    context.ethBlockCheckpoint = blockNumber.plus(ONE)
    save(id, context)
}

export function handleBlockProduced(event: BlockProduced): void {
    if (dataSource.network() == "mainnet") {
        createFromBlockProduced(event)
    }
    let id = contextID(event.address, event.params.index)
    update(id, event.block.number, event.block.timestamp)
}
