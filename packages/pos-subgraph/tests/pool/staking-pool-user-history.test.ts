// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { assert, clearStore, test } from "matchstick-as"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
    buildStakingPool,
    createStakingPoolDepositEvent,
    createStakingPoolStakeEvent,
    createStakingPoolUnstakeEvent,
    txHash,
    txTimestamp,
} from "../utils"
import {
    handleDeposit,
    handleStake,
    handleUnstake,
    STAKING_POOL_USER_HIST_ACTION_JOIN as JOIN,
    STAKING_POOL_USER_HIST_ACTION_LEAVE as LEAVE,
} from "../../src/pool"
import { StakingPoolUserHistory } from "../../generated/schema"

let STAKING_POOL_USER_HISTORY = "StakingPoolUserHistory"
const user = Address.fromString("0x0000000000000000000000000000000000000000")
const pool = Address.fromString("0x0000000000000000000000000000000000000001")

/**
 * Generates an event and also send it to the handle function.
 */
function generateDepositEvtFor(
    user: Address,
    pool: Address,
    amount: BigInt,
    timestamp: BigInt,
    hash: Bytes = txHash
): void {
    let evt = createStakingPoolDepositEvent(user, amount, timestamp)
    evt.transaction.hash = hash ? hash : evt.transaction.hash
    evt.block.timestamp = timestamp
    evt.address = pool
    handleDeposit(evt)
}

function getEntryIdFor(txHash: Bytes, pool: Address): string {
    return txHash.toHex() + "-" + pool.toHex()
}

test("Should create an entry when the user is staking for the first time", () => {
    // create a pool
    let stakingPool = buildStakingPool(pool, user)
    stakingPool.save()

    const amount = BigInt.fromI32(500)
    let shares = BigInt.fromI32(500)

    generateDepositEvtFor(user, pool, amount, BigInt.fromI32(txTimestamp))

    let event = createStakingPoolStakeEvent(user, amount, shares)
    let blockTimestamp = BigInt.fromI32(txTimestamp + 300) // adding 5 minutes
    event.block.timestamp = blockTimestamp
    event.address = pool
    handleStake(event)

    let entryId = txHash.toHex() + "-" + pool.toHex()
    assert.fieldEquals(STAKING_POOL_USER_HISTORY, entryId, "user", user.toHex())

    assert.fieldEquals(STAKING_POOL_USER_HISTORY, entryId, "pool", pool.toHex())

    assert.fieldEquals(STAKING_POOL_USER_HISTORY, entryId, "action", JOIN)

    assert.fieldEquals(STAKING_POOL_USER_HISTORY, entryId, "totalUsers", "1")

    assert.fieldEquals(
        STAKING_POOL_USER_HISTORY,
        entryId,
        "timestamp",
        blockTimestamp.toString()
    )

    clearStore()
})

test("Should not create another entry while user has shares and is doing consecutive stakes", () => {
    // create a pool
    let stakingPool = buildStakingPool(pool, user)
    stakingPool.save()

    const amount = BigInt.fromI32(500)
    let shares = BigInt.fromI32(500)

    generateDepositEvtFor(
        user,
        pool,
        BigInt.fromI32(2000),
        BigInt.fromI32(txTimestamp)
    )

    let firstEvent = createStakingPoolStakeEvent(user, amount, shares)
    let blockTimestamp = BigInt.fromI32(txTimestamp + 300) // adding 5 minutes
    firstEvent.block.timestamp = blockTimestamp
    firstEvent.address = pool
    handleStake(firstEvent)

    let secondEvt = createStakingPoolStakeEvent(user, amount, shares)
    let secondBlockTimestamp = blockTimestamp.plus(BigInt.fromI32(300)) // next five minutes
    let secondTxHash = Bytes.fromHexString(
        "0x0000000000000000000000000000000000000000000000000000000000000002"
    ) as Bytes

    secondEvt.transaction.hash = secondTxHash
    secondEvt.block.timestamp = secondBlockTimestamp
    secondEvt.address = pool
    handleStake(secondEvt)

    let entryId = txHash.toHex() + "-" + pool.toHex()
    assert.assertNotNull(StakingPoolUserHistory.load(entryId))

    let notExpectedEntryId = secondTxHash.toHex() + "-" + pool.toHex()

    assert.assertNull(StakingPoolUserHistory.load(notExpectedEntryId))

    clearStore()
})

test("Should add an entry when the user is leaving the staking pool i.e. they unstake all the shares", () => {
    // create a pool
    let stakingPool = buildStakingPool(pool, user)
    stakingPool.save()
    const user2 = Address.fromString(
        "0x0000000000000000000000000000000000000003"
    )
    const user3 = Address.fromString(
        "0x0000000000000000000000000000000000000004"
    )
    let secondTxHash = Bytes.fromHexString(
        "0x0000000000000000000000000000000000000000000000000000000000000004"
    ) as Bytes
    let thirdTxHash = Bytes.fromHexString(
        "0x0000000000000000000000000000000000000000000000000000000000000005"
    ) as Bytes

    const bigAmount = BigInt.fromI32(2000)
    const temp = BigInt.fromI32(txTimestamp)
    const amount = BigInt.fromI32(500)
    let shares = BigInt.fromI32(500)

    generateDepositEvtFor(
        user,
        pool,
        bigAmount,
        temp,
        Bytes.fromHexString(
            "0x0000000000000000000000000000000000000000000000000000000000000010"
        ) as Bytes
    )
    generateDepositEvtFor(
        user2,
        pool,
        bigAmount,
        temp,
        Bytes.fromHexString(
            "0x0000000000000000000000000000000000000000000000000000000000000011"
        ) as Bytes
    )
    generateDepositEvtFor(
        user3,
        pool,
        bigAmount,
        temp,
        Bytes.fromHexString(
            "0x0000000000000000000000000000000000000000000000000000000000000012"
        ) as Bytes
    )

    //Emulate events. PS: To avoid reference override create the event and sent it before creating "new" ones.
    let blockTimestamp = BigInt.fromI32(txTimestamp + 300) // adding 5 minutes
    let oneEvt = createStakingPoolStakeEvent(user, amount, shares)
    oneEvt.block.timestamp = blockTimestamp
    oneEvt.address = pool
    handleStake(oneEvt)

    let twoEvt = createStakingPoolStakeEvent(user2, amount, shares)
    twoEvt.transaction.hash = secondTxHash
    twoEvt.block.timestamp = blockTimestamp
    twoEvt.address = pool
    handleStake(twoEvt)

    let threeEvt = createStakingPoolStakeEvent(user3, amount, shares)
    threeEvt.transaction.hash = thirdTxHash
    threeEvt.block.timestamp = blockTimestamp
    threeEvt.address = pool
    handleStake(threeEvt)

    let entryOne = getEntryIdFor(txHash, pool)
    let entryTwo = getEntryIdFor(secondTxHash, pool)
    let entryThree = getEntryIdFor(thirdTxHash, pool)

    assert.fieldEquals(STAKING_POOL_USER_HISTORY, entryOne, "totalUsers", "1")
    assert.fieldEquals(STAKING_POOL_USER_HISTORY, entryOne, "action", JOIN)

    assert.fieldEquals(STAKING_POOL_USER_HISTORY, entryTwo, "totalUsers", "2")
    assert.fieldEquals(STAKING_POOL_USER_HISTORY, entryTwo, "action", JOIN)

    assert.fieldEquals(STAKING_POOL_USER_HISTORY, entryThree, "totalUsers", "3")
    assert.fieldEquals(STAKING_POOL_USER_HISTORY, entryThree, "action", JOIN)

    //Then lets unstake everything for the first user.
    let unstakeEvt = createStakingPoolUnstakeEvent(user, amount, shares)
    let newHash = Bytes.fromHexString(
        "0x0000000000000000000000000000000000000000000000000000000000000008"
    ) as Bytes

    unstakeEvt.transaction.hash = newHash
    let nextT = blockTimestamp.plus(BigInt.fromI32(300)) // five minutes after stake happen
    unstakeEvt.block.timestamp = nextT
    unstakeEvt.address = pool
    handleUnstake(unstakeEvt)

    let nextId = getEntryIdFor(newHash, pool)

    assert.fieldEquals(STAKING_POOL_USER_HISTORY, nextId, "totalUsers", "2")
    assert.fieldEquals(STAKING_POOL_USER_HISTORY, nextId, "user", user.toHex())
    assert.fieldEquals(STAKING_POOL_USER_HISTORY, nextId, "pool", pool.toHex())
    assert.fieldEquals(
        STAKING_POOL_USER_HISTORY,
        nextId,
        "timestamp",
        nextT.toString()
    )
    assert.fieldEquals(STAKING_POOL_USER_HISTORY, nextId, "action", LEAVE)

    clearStore()
})
