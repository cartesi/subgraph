import { assert, clearStore, test } from "matchstick-as"
import { handleRewarded } from "../../src/block"
import { createRewardedEvent, txHash, txTimestamp } from "../utils"
import { BigInt } from "@graphprotocol/graph-ts"
import { Summary } from "../../generated/schema"

test("New reward should store expected values", () => {
    const address = "0x0000000000000000000000000000000000000000"
    const reward = BigInt.fromI32(2900000000000000000000)
    const gasPrice = BigInt.fromI32(100000000000)
    const gasUsed = BigInt.fromI32(100000)
    const gasLimit = BigInt.fromI32(200000)
    const rewardEvent = createRewardedEvent(
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
        gasUsed.times(gasPrice).toString()
    )

    // assert Summary
    assert.fieldEquals("Summary", "1", "totalUsers", "1")
    assert.fieldEquals("Summary", "1", "totalBlocks", "1")
    assert.fieldEquals("Summary", "1", "totalReward", reward.toString())
    assert.fieldEquals(
        "Summary",
        "1",
        "totalTransactionFee",
        gasUsed.times(gasPrice).toString()
    )

    clearStore()
})
