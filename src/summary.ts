import { BigInt } from "@graphprotocol/graph-ts"
import { Summary } from "../generated/schema"

function createSummary(): Summary {
    let summary = new Summary("1")
    summary.totalStakers = BigInt.fromI32(0)
    summary.totalWorkers = BigInt.fromI32(0)
    summary.totalStaked = BigInt.fromI32(0)
    summary.totalTickets = BigInt.fromI32(0)
    return summary;
}

export function addStaker(): void {
    let summary = Summary.load("1") || createSummary()
    summary.totalStakers = summary.totalStakers.plus(BigInt.fromI32(1))
    summary.save()
}

export function addWorker(): void {
    let summary = Summary.load("1") || createSummary()
    summary.totalWorkers = summary.totalWorkers.plus(BigInt.fromI32(1))
    summary.save()
}

export function addTicket(): void {
    let summary = Summary.load("1") || createSummary()
    summary.totalTickets = summary.totalTickets.plus(BigInt.fromI32(1))
    summary.save()
}

export function addStaked(balance: BigInt): void {
    let summary = Summary.load("1") || createSummary()
    summary.totalStaked = summary.totalStaked.plus(balance)
    summary.save()
}
