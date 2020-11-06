import { Address } from "@graphprotocol/graph-ts"
import { Staker, Worker } from "../generated/schema"
import {
    JobAccepted,
    JobOffer,
    JobRejected,
    Retired,
} from "../generated/WorkerManager/WorkerManagerImpl"

function checkOrCreate(user: Address, worker: Address): Worker {
    let entity = Worker.load(worker.toHex())

    if (Staker.load(user.toHex()) === null) {
        let newUser = new Staker(user.toHex())
        newUser.save()
    }

    if (entity === null) {
        entity = new Worker(worker.toHex())
        entity.owner = user.toHex()
    }

    return entity!
}

export function handleJobOffer(event: JobOffer): void {
    let entity = checkOrCreate(event.params.user, event.params.worker)
    entity.status = "Pending"

    entity.save()
}

export function handleJobAccepted(event: JobAccepted): void {
    let entity = checkOrCreate(event.params.user, event.params.worker)
    entity.status = "Owned"

    entity.save()
}

export function handleJobRejected(event: JobRejected): void {
    let entity = checkOrCreate(event.params.user, event.params.worker)
    entity.status = "Available"

    entity.save()
}

export function handleRetired(event: Retired): void {
    let entity = checkOrCreate(event.params.user, event.params.worker)
    entity.status = "Retired"

    entity.save()
}
