import { assert, beforeEach, clearStore, log, test } from "matchstick-as"
import { handleRewarded } from "../../src/block"
import { createRewardedEvent, txHash, txTimestamp } from "../utils"
import { BigInt } from "@graphprotocol/graph-ts"
import { Summary } from "../../generated/schema"

beforeEach(() => {
    clearStore()
})

test("New reward should store expected values", () => {
    const index = BigInt.fromString("1")
    const address = "0x0000000000000000000000000000000000000000"
    const reward = BigInt.fromString("2900000000000000000000")
    const gasPrice = BigInt.fromString("100000000000")
    const gasUsed = BigInt.fromString("100000")
    const gasLimit = BigInt.fromString("200000")
    const transactionFee = gasUsed.times(gasPrice)
    const rewardEvent = createRewardedEvent(
        index,
        address,
        address,
        reward,
        gasPrice,
        gasLimit,
        gasUsed
    )
    handleRewarded(rewardEvent)

    // assert User
    assert.fieldEquals("User", address, "id", address)
    assert.fieldEquals(
        "User",
        address,
        "totalTransactionFee",
        transactionFee.toString()
    )

    // assert Block
    assert.fieldEquals(
        "Block",
        txHash.toHexString(),
        "reward",
        reward.toString()
    )
    assert.fieldEquals("Block", txHash.toHexString(), "producer", address)
    assert.fieldEquals("Block", txHash.toHexString(), "node", address)
    assert.fieldEquals(
        "Block",
        txHash.toHexString(),
        "timestamp",
        txTimestamp.toString()
    )
    assert.fieldEquals(
        "Block",
        txHash.toHexString(),
        "gasPrice",
        gasPrice.toString()
    )
    assert.fieldEquals(
        "Block",
        txHash.toHexString(),
        "gasLimit",
        gasLimit.toString()
    )
    assert.fieldEquals(
        "Block",
        txHash.toHexString(),
        "gasUsed",
        gasUsed.toString()
    )
    assert.fieldEquals(
        "Block",
        txHash.toHexString(),
        "transactionFee",
        transactionFee.toString()
    )

    // assert Summary
    assert.fieldEquals("Summary", "1", "totalUsers", "1")
    assert.fieldEquals("Summary", "1", "totalBlocks", "1")
    assert.fieldEquals("Summary", "1", "totalReward", reward.toString())
    assert.fieldEquals(
        "Summary",
        "1",
        "totalTransactionFee",
        transactionFee.toString()
    )
})
