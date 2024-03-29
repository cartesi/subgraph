// Copyright 2022 Cartesi Pte. Ltd.

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

import { NewChain } from "../generated/PoSV2FactoryImpl/PoSV2FactoryImpl"

export let HASHZERO = Bytes.fromByteArray(Bytes.fromI32(0)).toHex()
export let C_256 = BigInt.fromI32(256) // 256 blocks
export let ONE = BigInt.fromI32(1)
export let ADJUSTMENT_BASE = BigInt.fromI32(1000000) // 1M

export let cachedStore = new Map<string, BlockSelectorContext>()

export function load(id: string): BlockSelectorContext | null {
    if (cachedStore.has(id)) return cachedStore.get(id)

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
export function contextID(blockSelectorAddress: Bytes): string {
    return blockSelectorAddress.toHex()
}

export function create(event: NewChain, index: i32): BlockSelectorContext {
    let id = contextID(event.params.pos)
    let context = new BlockSelectorContext(id)

    context.index = index
    context.minDifficulty = event.params.minDifficulty
    context.targetInterval = event.params.targetInterval
    context.difficultyAdjustmentParameter =
        event.params.difficultyAdjustmentParameter

    context.ethBlockCheckpoint = event.block.number
    context.difficulty = event.params.initialDifficulty
    context.lastBlockTimestamp = event.block.timestamp
    save(id, context)

    return context
}

export function getDifficulty(id: string): BigInt {
    // context should be created by NewChain event
    let context = load(id)!
    return context.difficulty
}

export function update(
    id: string,
    blockNumber: BigInt,
    difficulty: BigInt,
    timestamp: BigInt
): void {
    let context = load(id)
    if (context == null) return // don't run before instantiation of the chain
    context.difficulty = difficulty
    context.ethBlockCheckpoint = blockNumber
    context.lastBlockTimestamp = timestamp
    save(id, context)
}
