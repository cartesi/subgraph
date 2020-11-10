import { BigInt } from "@graphprotocol/graph-ts";
import { Summary } from "../generated/schema";

export function addStaker(): void {
    let summary = Summary.load("1");
    if (!summary) {
        summary = new Summary("1");
    }

    summary.totalStakers = summary.totalStakers.plus(BigInt.fromI32(1));
    summary.save();
}

export function addWorker(): void {
    let summary = Summary.load("1");
    if (!summary) {
        summary = new Summary("1");
    }

    summary.totalWorkers = summary.totalWorkers.plus(BigInt.fromI32(1));
    summary.save();
}

export function addTicket(): void {
    let summary = Summary.load("1");
    if (!summary) {
        summary = new Summary("1");
    }

    summary.totalTickets = summary.totalTickets.plus(BigInt.fromI32(1));
    summary.save();
}

export function addStaked(balance: BigInt): void {
    let summary = Summary.load("1");
    if (!summary) {
        summary = new Summary("1");
    }

    summary.totalStaked = summary.totalStaked.plus(balance);
    summary.save();
}
