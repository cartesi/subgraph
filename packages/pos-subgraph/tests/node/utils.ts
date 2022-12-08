import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import { newMockEvent } from "matchstick-as"
import {
    Retired,
    JobRejected,
} from "../../generated/WorkerManagerAuthManager/WorkerManagerAuthManagerImpl"
import { Node } from "../../generated/schema"
import { loadOrCreate } from "../../src/node"
import { txHash } from "../utils"

export function createNode(
    user: Address,
    node: Address,
    timestamp: BigInt
): Node {
    const n = loadOrCreate(user, node, timestamp)
    n.save()
    return n
}

export function createRetiredEvent(
    user: Address,
    worker: Address,
    newTimestamp: BigInt
): Retired {
    let event = changetype<Retired>(newMockEvent())
    event.transaction.hash = txHash
    event.block.timestamp = newTimestamp
    event.parameters = new Array()
    event.parameters.push(
        new ethereum.EventParam("worker", ethereum.Value.fromAddress(worker))
    )
    event.parameters.push(
        new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
    )

    return event
}

export function createJobRejectedEvent(
    user: Address,
    worker: Address,
    newTimestamp: BigInt
): JobRejected {
    let event = changetype<JobRejected>(newMockEvent())
    event.transaction.hash = txHash
    event.block.timestamp = newTimestamp
    event.parameters = new Array()
    event.parameters.push(
        new ethereum.EventParam("worker", ethereum.Value.fromAddress(worker))
    )
    event.parameters.push(
        new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
    )

    return event
}
