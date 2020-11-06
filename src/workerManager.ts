import { Worker } from "../generated/schema"
import {
    JobAccepted,
    JobRejected,
    Retired,
} from "../generated/WorkerManager/WorkerManagerImpl"

export function handleJobAccepted(event: JobAccepted): void {
    let entity = Worker.load(event.params.worker.toHex())

    if (entity === null) {
        entity = new Worker(event.params.worker.toHex())
        entity.owner = event.params.user.toHex()
    }

    entity.status = "JobAccepted"

    entity.save()
}

export function handleJobRejected(event: JobRejected): void {
    let entity = Worker.load(event.params.worker.toHex())

    if (entity === null) {
        entity = new Worker(event.params.worker.toHex())
        entity.owner = event.params.user.toHex()
    }

    entity.status = "JobRejected"

    entity.save()
}

export function handleRetired(event: Retired): void {
    let entity = Worker.load(event.params.worker.toHex())

    if (entity === null) {
        entity = new Worker(event.params.worker.toHex())
        entity.owner = event.params.user.toHex()
    }

    entity.status = "Retired"

    entity.save()
}
