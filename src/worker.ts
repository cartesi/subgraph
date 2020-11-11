import { Address, BigInt } from "@graphprotocol/graph-ts"
import { Worker } from "../generated/schema"
import { addWorker, removeWorker } from "./summary"
import { loadOrCreate as loadOrCreateStaker } from "./staker"
import {
    JobAccepted,
    JobOffer,
    JobRejected,
    Retired,
} from "../generated/WorkerManager/WorkerManagerImpl"
import {
    Authorization,
    Deauthorization,
} from "../generated/WorkerAuthManager/WorkerAuthManagerImpl"

export function loadOrCreate(
    userAddress: Address,
    workerAddress: Address,
    timestamp: BigInt
): Worker {
    let worker = Worker.load(workerAddress.toHex())
    loadOrCreateStaker(userAddress)

    if (worker === null) {
        worker = new Worker(workerAddress.toHex())
        worker.owner = userAddress.toHex()
        worker.timestamp = timestamp
        worker.totalTickets = BigInt.fromI32(0)
        worker.totalReward = BigInt.fromI32(0)
        addWorker()
    }

    return worker!
}

export function handleJobOffer(event: JobOffer): void {
    let worker = loadOrCreate(
        event.params.user,
        event.params.worker,
        event.block.timestamp
    )
    worker.status = "Pending"
    worker.save()
}

export function handleJobAccepted(event: JobAccepted): void {
    let worker = loadOrCreate(
        event.params.user,
        event.params.worker,
        event.block.timestamp
    )
    worker.status = "Owned"
    worker.save()
}

export function handleJobRejected(event: JobRejected): void {
    let worker = loadOrCreate(
        event.params.user,
        event.params.worker,
        event.block.timestamp
    )
    worker.status = "Available"
    worker.save()
}

export function handleRetired(event: Retired): void {
    let worker = loadOrCreate(
        event.params.user,
        event.params.worker,
        event.block.timestamp
    )
    worker.status = "Retired"
    worker.save()
    removeWorker()
}

export function handleAuthorization(event: Authorization): void {
    let worker = loadOrCreate(
        event.params.user,
        event.params.worker,
        event.block.timestamp
    )
    worker.status = "Authorized"
    worker.save()
}

export function handleDeauthorization(event: Deauthorization): void {
    let worker = loadOrCreate(
        event.params.user,
        event.params.worker,
        event.block.timestamp
    )
    worker.status = "Deauthorized"
    worker.save()
}
