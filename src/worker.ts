import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Staker, Worker } from "../generated/schema";
import { addStaker, addWorker } from "./summary";
import {
    JobAccepted,
    JobOffer,
    JobRejected,
    Retired,
} from "../generated/WorkerManager/WorkerManagerImpl";
import {
    Authorization,
    Deauthorization,
} from "../generated/WorkerAuthManager/WorkerAuthManagerImpl";

function loadOrCreate(
    userAddress: Address,
    workerAddress: Address,
    timestamp: BigInt
): Worker {
    let worker = Worker.load(workerAddress.toHex());
    let user = Staker.load(userAddress.toHex());

    if (user === null) {
        user = new Staker(userAddress.toHex());
        user.stakedBalance = BigInt.fromI32(0);
        user.maturingBalance = BigInt.fromI32(0);
        user.maturation = BigInt.fromI32(0);
        user.totalTickets = BigInt.fromI32(0);
        user.save();
        addStaker();
    }

    if (worker === null) {
        worker = new Worker(workerAddress.toHex());
        worker.owner = userAddress.toHex();
        worker.timestamp = timestamp;
        addWorker();
    }

    return worker!;
}

export function handleJobOffer(event: JobOffer): void {
    let worker = loadOrCreate(
        event.params.user,
        event.params.worker,
        event.block.timestamp
    );
    worker.status = "Pending";
    worker.save();
}

export function handleJobAccepted(event: JobAccepted): void {
    let worker = loadOrCreate(
        event.params.user,
        event.params.worker,
        event.block.timestamp
    );
    worker.status = "Owned";
    worker.save();
}

export function handleJobRejected(event: JobRejected): void {
    let worker = loadOrCreate(
        event.params.user,
        event.params.worker,
        event.block.timestamp
    );
    worker.status = "Available";
    worker.save();
}

export function handleRetired(event: Retired): void {
    let worker = loadOrCreate(
        event.params.user,
        event.params.worker,
        event.block.timestamp
    );
    worker.status = "Retired";
    worker.save();
}

export function handleAuthorization(event: Authorization): void {
    let entity = loadOrCreate(
        event.params.user,
        event.params.worker,
        event.block.timestamp
    );
    entity.status = "Authorized";
    entity.save();
}

export function handleDeauthorization(event: Deauthorization): void {
    let entity = loadOrCreate(
        event.params.user,
        event.params.worker,
        event.block.timestamp
    );
    entity.status = "Deauthorized";
    entity.save();
}
