import { BigInt } from "@graphprotocol/graph-ts"
import { Summary } from "../generated/schema"

function createSummary(): Summary {
    let summary = new Summary("1")
    summary.totalStakers = 0
    summary.totalWorkers = 0
    summary.totalStaked = BigInt.fromI32(0)
    summary.totalBlocks = 0
    summary.totalReward = BigInt.fromI32(0)
    summary.totalChains = 0
    return summary
}

export function addStaker(): void {
    let summary = Summary.load("1") || createSummary()
    summary.totalStakers++
    summary.save()
}

export function addWorker(): void {
    let summary = Summary.load("1") || createSummary()
    summary.totalWorkers++
    summary.save()
}

export function removeWorker(): void {
    let summary = Summary.load("1") || createSummary()
    summary.totalWorkers++
    summary.save()
}

export function addBlock(): void {
    let summary = Summary.load("1") || createSummary()
    summary.totalBlocks++
    summary.save()
}

export function setChainId(chainId: i32): void {
    let summary = Summary.load("1") || createSummary()
    if ((chainId + 1) > summary.totalChains) {
        summary.totalChains = chainId + 1
    }
    summary.save()
}

export function addReward(balance: BigInt): void {
    let summary = Summary.load("1") || createSummary()
    summary.totalReward = summary.totalReward.plus(balance)
    summary.save()
}

export function addStake(balance: BigInt): void {
    let summary = Summary.load("1") || createSummary()
    summary.totalStaked = summary.totalStaked.plus(balance)
    summary.save()
}

export function removeStake(balance: BigInt): void {
    let summary = Summary.load("1") || createSummary()
    summary.totalStaked = summary.totalStaked.minus(balance)
    summary.save()
}
