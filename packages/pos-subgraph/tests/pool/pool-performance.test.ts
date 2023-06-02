import { assert, clearStore, describe, test } from "matchstick-as"
import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts"
import {
    calculateMonthlyPerformance,
    calculateWeeklyPerformance,
} from "../../src/pool"
import {
    createNewBlockProducedV2Event,
    txTimestamp,
    posV2Address,
    createBlockProduced,
    buildStakingPool,
    buildWeeklyPoolPerformance,
    buildMonthlyPoolPerformance,
} from "../utils"
import {
    WeeklyPoolPerformance,
    MonthlyPoolPerformance,
    PoolBalance,
} from "../../generated/schema"
import { log } from "@graphprotocol/graph-ts"
const user = Address.fromString("0x0000000000000000000000000000000000000000")
const pool = Address.fromString("0x0000000000000000000000000000000000000001")

let WEEKLY_POOL_PERFORMANCE = "WeeklyPoolPerformance"
let MONTHLY_POOL_PERFORMANCE = "MonthlyPoolPerformance"
let POOL_BALANCE = "PoolBalance"

function buildPoolPerformanceId(
    pool: Address,
    duration: string,
    timestamp: BigInt
): string {
    let convertTimestamp =
        duration === "week"
            ? timestamp.toI32() / 604800
            : timestamp.toI32() / 2628000
    return pool.toHex() + "-" + convertTimestamp.toString()
}

test("[WeeklyPoolPerformance] Block Produced Event should increase the weekly shareValue", () => {
    const amount = BigInt.fromI32(2000)
    let stakingPool = buildStakingPool(pool, user)
    stakingPool.amount = BigInt.fromI32(1000)
    stakingPool.shares = BigInt.fromI32(1000)
    stakingPool.save()
    let event = createBlockProduced(pool, BigInt.fromI32(txTimestamp), amount)
    let poolPerformanceId = buildPoolPerformanceId(
        event.address,
        "week",
        BigInt.fromI32(txTimestamp)
    )
    calculateWeeklyPerformance(stakingPool, event)
    assert.fieldEquals(
        WEEKLY_POOL_PERFORMANCE,
        poolPerformanceId,
        "shareValue",
        "1000000000"
    )
    assert.fieldEquals(
        WEEKLY_POOL_PERFORMANCE,
        poolPerformanceId,
        "performance",
        "0"
    )
    clearStore()
})

test("[WeeklyPoolPerformance] Block Produced Event on the previous week should increase the performance value", () => {
    const amount = BigInt.fromI32(2000)
    let stakingPool = buildStakingPool(pool, user)
    stakingPool.amount = BigInt.fromI32(1000)
    stakingPool.shares = BigInt.fromI32(1000)
    stakingPool.save()

    let event = createBlockProduced(
        pool,
        BigInt.fromI32(txTimestamp).plus(BigInt.fromI32(604800)),
        amount
    )
    let poolPerformanceId = buildPoolPerformanceId(
        event.address,
        "week",
        BigInt.fromI32(txTimestamp)
    )
    let weeklyPerformance = buildWeeklyPoolPerformance(
        poolPerformanceId,
        pool,
        BigInt.fromI32(txTimestamp)
    )
    weeklyPerformance.shareValue = BigDecimal.fromString("1")
    weeklyPerformance.save()
    // Block Produced a week from now
    calculateWeeklyPerformance(stakingPool, event)
    let cwp = WeeklyPoolPerformance.load(
        buildPoolPerformanceId(
            pool,
            "week",
            BigInt.fromI32(txTimestamp).plus(BigInt.fromI32(604800))
        )
    )!
    assert.fieldEquals(
        WEEKLY_POOL_PERFORMANCE,
        cwp.id,
        "performance",
        "999999999"
    )
    clearStore()
})
test("[MonthlyPoolPerformance] Block Produced Event should increase the monthly shareValue", () => {
    const amount = BigInt.fromI32(2000)
    let stakingPool = buildStakingPool(pool, user)
    stakingPool.amount = BigInt.fromI32(1000)
    stakingPool.shares = BigInt.fromI32(1000)
    stakingPool.save()
    let event = createBlockProduced(pool, BigInt.fromI32(txTimestamp), amount)
    let poolPerformanceId = buildPoolPerformanceId(
        event.address,
        "month",
        BigInt.fromI32(txTimestamp)
    )
    calculateMonthlyPerformance(stakingPool, event)
    assert.fieldEquals(
        MONTHLY_POOL_PERFORMANCE,
        poolPerformanceId,
        "shareValue",
        "1000000000"
    )
    assert.fieldEquals(
        MONTHLY_POOL_PERFORMANCE,
        poolPerformanceId,
        "performance",
        "0"
    )
    clearStore()
})
test("[MonthlyPoolPerformance] Block Produced Event on the previous month should increase the performance value", () => {
    const amount = BigInt.fromI32(2000)
    let stakingPool = buildStakingPool(pool, user)
    stakingPool.amount = BigInt.fromI32(1000)
    stakingPool.shares = BigInt.fromI32(1000)
    stakingPool.save()

    let event = createBlockProduced(
        pool,
        BigInt.fromI32(txTimestamp).plus(BigInt.fromI32(2628000)),
        amount
    )
    let poolPerformanceId = buildPoolPerformanceId(
        event.address,
        "month",
        BigInt.fromI32(txTimestamp)
    )
    let monthlyPerformance = buildMonthlyPoolPerformance(
        poolPerformanceId,
        pool,
        BigInt.fromI32(txTimestamp)
    )
    monthlyPerformance.shareValue = BigDecimal.fromString("1")
    monthlyPerformance.save()
    // Block Produced a week from now
    calculateMonthlyPerformance(stakingPool, event)
    let cwp = MonthlyPoolPerformance.load(
        buildPoolPerformanceId(
            pool,
            "month",
            BigInt.fromI32(txTimestamp).plus(BigInt.fromI32(2628000))
        )
    )!
    assert.fieldEquals(
        MONTHLY_POOL_PERFORMANCE,
        cwp.id,
        "performance",
        "999999999"
    )
    clearStore()
})
