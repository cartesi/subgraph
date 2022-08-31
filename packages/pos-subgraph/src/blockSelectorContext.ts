// Copyright 2020 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { BlockSelectorContext } from "../generated/schema"

import { NewChain } from "../generated/PoS/PoS"

export let HASHZERO = Bytes.fromByteArray(Bytes.fromI32(0)).toHexString()
export let C_256 = BigInt.fromI32(256) // 256 blocks
export let ONE = BigInt.fromI32(1)
export let ADJUSTMENT_BASE = BigInt.fromI32(1000000) // 1M

export let cachedStore = new Map<string, BlockSelectorContext>()

export function load(id: string): BlockSelectorContext | null {
    if (cachedStore.has(id)) return cachedStore.get(id)!

    let context = BlockSelectorContext.load(id)
    if (context != null) {
        cachedStore.set(id, context)
        return context
    }
    return null
}

export function save(id: string, context: BlockSelectorContext): void {
    cachedStore.set(id, context)
    context.save()
}
export function contextID(
    blockSelectorAddress: Bytes,
    chainIndex: BigInt
): string {
    return blockSelectorAddress.toHexString() + "-" + chainIndex.toString()
}

export function create(event: NewChain): BlockSelectorContext {
    let id = contextID(event.params.blockSelectorAddress, event.params.index)
    let context = new BlockSelectorContext(id)

    context.minDifficulty = event.params.minimumDifficulty
    context.targetInterval = event.params.targetInterval
    context.difficultyAdjustmentParameter =
        event.params.difficultyAdjustmentParameter

    context.ethBlockCheckpoint = event.block.number
    context.difficulty = event.params.initialDifficulty
    context.index = event.params.index.isI32() ? event.params.index.toI32() : 0
    context.lastBlockTimestamp = event.block.timestamp
    save(id, context)

    return context
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
    _blocksPassed: BigInt,
    _targetInterval: BigInt,
    _adjustmentParam: BigInt
): BigInt {
    // @dev to save gas on evaluation, instead of returning the _oldDiff when the target
    // was exactly matched - we increase the difficulty.
    if (_blocksPassed.le(_targetInterval)) {
        return _oldDiff.plus(
            _oldDiff.times(_adjustmentParam).div(ADJUSTMENT_BASE).plus(ONE)
        )
    }

    let newDiff: BigInt = _oldDiff.minus(
        _oldDiff.times(_adjustmentParam).div(ADJUSTMENT_BASE).plus(ONE)
    )

    return newDiff.gt(_minDiff) ? newDiff : _minDiff
}

export function update(id: string, blockNumber: BigInt): void {
    let context = load(id)
    if (context == null) return // don't run before instantiation of the chain
    context.difficulty = getNewDifficulty(
        context.minDifficulty,
        context.difficulty,
        blockNumber.minus(context.ethBlockCheckpoint),
        context.targetInterval,
        context.difficultyAdjustmentParameter
    )
    context.ethBlockCheckpoint = blockNumber
    save(id, context)
}
