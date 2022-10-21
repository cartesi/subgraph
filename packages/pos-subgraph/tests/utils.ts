// Copyright 2021 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import {
    assert,
    newMockEvent,
    clearStore,
    logStore,
    test,
    log,
} from "matchstick-as"
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import { Stake, Unstake, Withdraw } from "../generated/StakingImpl/StakingImpl"
import { StakingPoolFee } from "../generated/schema"
import { FlatRateChanged } from "../generated/templates/FlatRateCommission/FlatRateCommission"
import { GasTaxChanged } from "../generated/templates/GasTaxCommission/GasTaxCommission"
import { BlockSelectorContext, StakingPool } from "../generated/schema"
import { NewChain } from "../generated/PoS/PoS"
import { NewChain as NewChainV2 } from "../generated/PoSV2FactoryImpl/PoSV2FactoryImpl"
import { BlockProduced } from "../generated/BlockSelector-1.0/BlockSelector"
import { BlockProduced as BlockProducedV2 } from "../generated/templates/PoSV2Impl/PoSV2Impl"
import {
    Deposit,
    Stake as StakePool,
    Unstake as UnstakePool,
    Withdraw as WithdrawPool,
} from "../generated/templates/StakingPoolImpl/StakingPoolImpl"
import * as user from "../src/user"

export const posV2Address = "0x0000000000000000000000000000000000000123"
export const txHash = Bytes.fromHexString(
    "0x0000000000000000000000000000000000000000000000000000000000000001"
) as Bytes
/**
 * represents the UTC datetime Thursday, August 26, 2021 05:46:40 PM
 */
export const txTimestamp = 1630000000
export const ZERO = BigInt.fromI32(0)

/**
 * Builds a dummy staking pool with all the required fields filled
 * @param address
 * @param manager
 * @param timestamp
 * @returns
 */
export function buildStakingPool(
    address: Address,
    manager: Address,
    timestamp: BigInt = BigInt.fromI32(0)
): StakingPool {
    let u = user.loadOrCreate(address)
    // create pool
    let pool = new StakingPool(address.toHex())
    pool.manager = manager.toHex()
    pool.user = u.id
    pool.amount = BigInt.fromI32(0)
    pool.shares = BigInt.fromI32(0)
    pool.totalUsers = 0
    pool.totalCommission = BigInt.fromI32(0)
    pool.timestamp = timestamp
    pool.paused = false
    pool.fee = "0x0000000000000000000000000000000000000099"

    // circular reference between pool and user
    u.pool = pool.id
    u.save()

    return pool
}

export function buildStakingPoolFee(
    address: Address,
    pool: Address,
    timestamp: BigInt
): StakingPoolFee {
    let fee = new StakingPoolFee(address.toHex())
    fee.created = timestamp
    fee.lastUpdated = timestamp
    fee.pool = pool.toHex()
    return fee
}

export function createFlatRateChangedEvent(
    address: Address,
    newRate: BigInt,
    newTimestamp: BigInt
): FlatRateChanged {
    let event = changetype<FlatRateChanged>(newMockEvent())
    event.transaction.hash = txHash
    event.block.timestamp = newTimestamp
    event.address = address
    event.parameters = new Array()
    event.parameters.push(
        new ethereum.EventParam(
            "newRate",
            ethereum.Value.fromUnsignedBigInt(newRate)
        )
    )

    return event
}

export function createGasTaxChangedEvent(
    address: Address,
    newGas: BigInt,
    newTimestamp: BigInt
): GasTaxChanged {
    let evt = changetype<GasTaxChanged>(newMockEvent())
    evt.transaction.hash = txHash
    evt.block.timestamp = newTimestamp
    evt.address = address
    evt.parameters = new Array()
    evt.parameters.push(
        new ethereum.EventParam(
            "newGas",
            ethereum.Value.fromUnsignedBigInt(newGas)
        )
    )
    return evt
}

export function createStakingPoolDepositEvent(
    user: Address,
    amount: BigInt,
    stakeTimestamp: BigInt
): Deposit {
    let event = changetype<Deposit>(newMockEvent())
    event.transaction.hash = txHash
    event.block.timestamp = BigInt.fromI32(txTimestamp)
    event.parameters = new Array()
    event.parameters.push(
        new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
    )
    event.parameters.push(
        new ethereum.EventParam(
            "amount",
            ethereum.Value.fromUnsignedBigInt(amount)
        )
    )

    event.parameters.push(
        new ethereum.EventParam(
            "stakeTimestamp",
            ethereum.Value.fromUnsignedBigInt(stakeTimestamp)
        )
    )

    return event
}

export function createStakingPoolStakeEvent(
    user: Address,
    amount: BigInt,
    shares: BigInt,
    timestamp: BigInt = BigInt.fromI32(txTimestamp) // Thursday, August 26, 2021 05:46:40 PM
): StakePool {
    let event = changetype<StakePool>(newMockEvent())
    event.transaction.hash = txHash
    event.block.timestamp = timestamp
    event.parameters = new Array()
    event.parameters.push(
        new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
    )
    event.parameters.push(
        new ethereum.EventParam(
            "amount",
            ethereum.Value.fromUnsignedBigInt(amount)
        )
    )

    event.parameters.push(
        new ethereum.EventParam(
            "shares",
            ethereum.Value.fromUnsignedBigInt(shares)
        )
    )

    return event
}

export function createStakingPoolUnstakeEvent(
    user: Address,
    amount: BigInt,
    shares: BigInt
): UnstakePool {
    let event = changetype<UnstakePool>(newMockEvent())
    event.transaction.hash = txHash
    event.block.timestamp = BigInt.fromI32(txTimestamp) // Thursday, August 26, 2021 05:46:40 PM
    event.parameters = new Array()
    event.parameters.push(
        new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
    )
    event.parameters.push(
        new ethereum.EventParam(
            "amount",
            ethereum.Value.fromUnsignedBigInt(amount)
        )
    )

    event.parameters.push(
        new ethereum.EventParam(
            "shares",
            ethereum.Value.fromUnsignedBigInt(shares)
        )
    )

    return event
}

export function createStakingPoolWithdrawEvent(
    user: Address,
    amount: BigInt
): WithdrawPool {
    let event = changetype<WithdrawPool>(newMockEvent())
    event.transaction.hash = txHash
    event.block.timestamp = BigInt.fromI32(txTimestamp) // Thursday, August 26, 2021 05:46:40 PM
    event.parameters = new Array()
    event.parameters.push(
        new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
    )
    event.parameters.push(
        new ethereum.EventParam(
            "amount",
            ethereum.Value.fromUnsignedBigInt(amount)
        )
    )

    return event
}

export function createStakeEvent(
    user: string,
    amount: BigInt,
    maturationDate: BigInt
): Stake {
    let event = changetype<Stake>(newMockEvent())
    event.transaction.hash = txHash
    event.block.timestamp = BigInt.fromI32(txTimestamp) // Thursday, August 26, 2021 05:46:40 PM
    event.parameters = new Array()
    event.parameters.push(
        new ethereum.EventParam(
            "user",
            ethereum.Value.fromAddress(Address.fromString(user))
        )
    )
    event.parameters.push(
        new ethereum.EventParam(
            "amount",
            ethereum.Value.fromUnsignedBigInt(amount)
        )
    )
    event.parameters.push(
        new ethereum.EventParam(
            "maturationDate",
            ethereum.Value.fromUnsignedBigInt(maturationDate)
        )
    )
    return event
}

export function createUnstakeEvent(
    user: string,
    amount: BigInt,
    maturationDate: BigInt
): Unstake {
    let event = changetype<Unstake>(newMockEvent())
    event.transaction.hash = txHash
    event.block.timestamp = BigInt.fromI32(1630000000) // Thursday, August 26, 2021 05:46:40 PM
    event.parameters = new Array()
    event.parameters.push(
        new ethereum.EventParam(
            "user",
            ethereum.Value.fromAddress(Address.fromString(user))
        )
    )
    event.parameters.push(
        new ethereum.EventParam(
            "amount",
            ethereum.Value.fromUnsignedBigInt(amount)
        )
    )
    event.parameters.push(
        new ethereum.EventParam(
            "maturationDate",
            ethereum.Value.fromUnsignedBigInt(maturationDate)
        )
    )
    return event
}

export function createWithdrawEvent(user: string, amount: BigInt): Withdraw {
    let event = changetype<Withdraw>(newMockEvent())
    event.transaction.hash = txHash
    event.block.timestamp = BigInt.fromI32(1630000000) // Thursday, August 26, 2021 05:46:40 PM
    event.parameters = new Array()
    event.parameters.push(
        new ethereum.EventParam(
            "user",
            ethereum.Value.fromAddress(Address.fromString(user))
        )
    )
    event.parameters.push(
        new ethereum.EventParam(
            "amount",
            ethereum.Value.fromUnsignedBigInt(amount)
        )
    )
    return event
}

export function assertUser(
    address: string,
    stakedBalance: BigInt,
    maturingBalance: BigInt,
    maturingTimestamp: BigInt,
    releasingBalance: BigInt,
    releasingTimestamp: BigInt
): void {
    assert.fieldEquals("User", address, "id", address)
    assert.fieldEquals(
        "User",
        address,
        "stakedBalance",
        stakedBalance.toString()
    )
    assert.fieldEquals(
        "User",
        address,
        "maturingBalance",
        maturingBalance.toString()
    )
    assert.fieldEquals(
        "User",
        address,
        "maturingTimestamp",
        maturingTimestamp.toString()
    )
    assert.fieldEquals(
        "User",
        address,
        "releasingBalance",
        releasingBalance.toString()
    )
    assert.fieldEquals(
        "User",
        address,
        "releasingTimestamp",
        releasingTimestamp.toString()
    )
    assert.fieldEquals(
        "User",
        address,
        "balance",
        stakedBalance.plus(maturingBalance).toString()
    )
}

export let HASHZERO = Bytes.fromByteArray(Bytes.fromI32(0)).toHexString()

export function zeroID(): string {
    return blockSelectorAddress.toHexString() + "-0"
}
export let blockSelectorAddress = Address.fromString(
    "0x0000000000000000000000000000000000000123"
)

export function createNewBlockProducedV1Event(
    index: i32,
    targetInterval: i32,
    _blockSelectorAddress: string,
    producerAddress: string,
    blockNumber: BigInt
): BlockProduced {
    let mockEvent = newMockEvent()
    mockEvent.block.number = blockNumber
    let blockProducedEvent = new BlockProduced(
        Address.fromString(_blockSelectorAddress),
        mockEvent.logIndex,
        mockEvent.transactionLogIndex,
        mockEvent.logType,
        mockEvent.block,
        mockEvent.transaction,
        mockEvent.parameters,
        null
    )
    blockProducedEvent.parameters = new Array()

    blockProducedEvent.parameters.push(
        new ethereum.EventParam("index", ethereum.Value.fromI32(index))
    )
    blockProducedEvent.parameters.push(
        new ethereum.EventParam(
            "producer",
            ethereum.Value.fromAddress(Address.fromString(producerAddress))
        )
    )

    blockProducedEvent.parameters.push(
        new ethereum.EventParam("blockNumber", ethereum.Value.fromI32(0))
    )
    blockProducedEvent.parameters.push(
        new ethereum.EventParam("roundDuration", ethereum.Value.fromI32(0))
    )
    blockProducedEvent.parameters.push(
        new ethereum.EventParam("difficulty", ethereum.Value.fromI32(0))
    )
    blockProducedEvent.parameters.push(
        new ethereum.EventParam(
            "targetInterval",
            ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(targetInterval))
        )
    )
    return blockProducedEvent
}

export function createNewBlockProducedV2Event(
    posAddress: string,
    producerAddress: string,
    blockNumber: BigInt
): BlockProducedV2 {
    let mockEvent = newMockEvent()
    mockEvent.block.number = blockNumber
    let blockProducedEvent = new BlockProducedV2(
        Address.fromString(posAddress),
        mockEvent.logIndex,
        mockEvent.transactionLogIndex,
        mockEvent.logType,
        mockEvent.block,
        mockEvent.transaction,
        mockEvent.parameters,
        null
    )
    blockProducedEvent.parameters = new Array()

    blockProducedEvent.parameters.push(
        new ethereum.EventParam(
            "producer",
            ethereum.Value.fromAddress(Address.fromString(producerAddress))
        )
    )
    blockProducedEvent.parameters.push(
        new ethereum.EventParam(
            "worker",
            ethereum.Value.fromAddress(Address.fromString(producerAddress))
        )
    )
    blockProducedEvent.parameters.push(
        new ethereum.EventParam(
            "sidechainBlockNumber",
            ethereum.Value.fromI32(0)
        )
    )
    blockProducedEvent.parameters.push(
        new ethereum.EventParam("data", ethereum.Value.fromBytes(new Bytes(0)))
    )
    return blockProducedEvent
}

export function createNewChainEvent(
    minDifficulty: BigInt,
    targetInterval: BigInt,
    difficultyAdjustmentParameter: BigInt,
    initialDifficulty: BigInt,
    blockNumber: BigInt
): NewChain {
    let mockEvent = newMockEvent()

    const newEvent = new NewChain(
        mockEvent.address,
        mockEvent.logIndex,
        mockEvent.transactionLogIndex,
        mockEvent.logType,
        mockEvent.block,
        mockEvent.transaction,
        mockEvent.parameters,
        null
    )
    newEvent.parameters = new Array()

    newEvent.parameters.push(
        new ethereum.EventParam("index", ethereum.Value.fromI32(0))
    )
    newEvent.parameters.push(
        new ethereum.EventParam(
            "stakingAddress",
            ethereum.Value.fromAddress(Address.zero())
        )
    )
    newEvent.parameters.push(
        new ethereum.EventParam(
            "blockSelectorAddress",
            ethereum.Value.fromAddress(blockSelectorAddress)
        )
    )
    newEvent.parameters.push(
        new ethereum.EventParam(
            "workerAuthAddress",
            ethereum.Value.fromAddress(Address.zero())
        )
    )
    newEvent.parameters.push(
        new ethereum.EventParam(
            "minimumDifficulty",
            ethereum.Value.fromUnsignedBigInt(minDifficulty)
        )
    )
    newEvent.parameters.push(
        new ethereum.EventParam(
            "initialDifficulty",
            ethereum.Value.fromUnsignedBigInt(initialDifficulty)
        )
    )
    newEvent.parameters.push(
        new ethereum.EventParam(
            "difficultyAdjustmentParameter",
            ethereum.Value.fromUnsignedBigInt(difficultyAdjustmentParameter)
        )
    )
    newEvent.parameters.push(
        new ethereum.EventParam(
            "targetInterval",
            ethereum.Value.fromUnsignedBigInt(targetInterval)
        )
    )
    newEvent.parameters.push(
        new ethereum.EventParam(
            "ctsiAddress",
            ethereum.Value.fromAddress(Address.zero())
        )
    )
    newEvent.parameters.push(
        new ethereum.EventParam("maxReward", ethereum.Value.fromI32(0))
    )
    newEvent.parameters.push(
        new ethereum.EventParam("minReward", ethereum.Value.fromI32(0))
    )
    newEvent.parameters.push(
        new ethereum.EventParam("distNumerator", ethereum.Value.fromI32(0))
    )
    newEvent.parameters.push(
        new ethereum.EventParam("distDenominator", ethereum.Value.fromI32(0))
    )

    newEvent.block.number = blockNumber
    return newEvent
}

export function createNewChainV2Event(
    minDifficulty: BigInt,
    targetInterval: BigInt,
    difficultyAdjustmentParameter: BigInt,
    initialDifficulty: BigInt,
    blockNumber: BigInt
): NewChainV2 {
    let mockEvent = newMockEvent()

    const newEvent = new NewChainV2(
        mockEvent.address,
        mockEvent.logIndex,
        mockEvent.transactionLogIndex,
        mockEvent.logType,
        mockEvent.block,
        mockEvent.transaction,
        mockEvent.parameters,
        null
    )
    newEvent.parameters = new Array()

    newEvent.parameters.push(
        new ethereum.EventParam(
            "pos",
            ethereum.Value.fromAddress(Address.fromString(posV2Address))
        )
    )
    newEvent.parameters.push(
        new ethereum.EventParam(
            "ctsiAddress",
            ethereum.Value.fromAddress(Address.zero())
        )
    )
    newEvent.parameters.push(
        new ethereum.EventParam(
            "stakingAddress",
            ethereum.Value.fromAddress(Address.zero())
        )
    )
    newEvent.parameters.push(
        new ethereum.EventParam(
            "workerAuthAddress",
            ethereum.Value.fromAddress(Address.zero())
        )
    )
    newEvent.parameters.push(
        new ethereum.EventParam(
            "initialDifficulty",
            ethereum.Value.fromUnsignedBigInt(initialDifficulty)
        )
    )
    newEvent.parameters.push(
        new ethereum.EventParam(
            "minDifficulty",
            ethereum.Value.fromUnsignedBigInt(minDifficulty)
        )
    )
    newEvent.parameters.push(
        new ethereum.EventParam(
            "difficultyAdjustmentParameter",
            ethereum.Value.fromUnsignedBigInt(difficultyAdjustmentParameter)
        )
    )
    newEvent.parameters.push(
        new ethereum.EventParam(
            "targetInterval",
            ethereum.Value.fromUnsignedBigInt(targetInterval)
        )
    )
    newEvent.parameters.push(
        new ethereum.EventParam("rewardValue", ethereum.Value.fromI32(0))
    )
    newEvent.parameters.push(
        new ethereum.EventParam("rewardDelay", ethereum.Value.fromI32(3))
    )
    newEvent.parameters.push(
        new ethereum.EventParam("version", ethereum.Value.fromI32(1))
    )

    newEvent.block.number = blockNumber
    return newEvent
}

export function zeroedNewBlockSelectorContext(): BlockSelectorContext {
    let context = new BlockSelectorContext(zeroID())
    context.minDifficulty = BigInt.fromI32(0)
    context.targetInterval = BigInt.fromI32(0)
    context.difficultyAdjustmentParameter = BigInt.fromI32(0)
    context.ethBlockCheckpoint = BigInt.fromI32(0)
    context.difficulty = BigInt.fromI32(0)
    context.lastBlockTimestamp = BigInt.fromI32(0)
    context.index = 0
    return context
}
