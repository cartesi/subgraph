import { Worker } from "../generated/schema"
import {
    Authorization,
    Deauthorization,
} from "../generated/WorkerAuthManager/WorkerAuthManagerImpl"

export function handleAuthorization(event: Authorization): void {
    let entity = Worker.load(event.params.worker.toHex())

    if (entity === null) {
        entity = new Worker(event.params.worker.toHex())
        entity.owner = event.params.user.toHex()
    }

    entity.dapp = event.params.dapp
    entity.status = "Authorized"

    entity.save()
}

export function handleDeauthorization(event: Deauthorization): void {
    let entity = Worker.load(event.params.worker.toHex())

    if (entity === null) {
        entity = new Worker(event.params.worker.toHex())
        entity.owner = event.params.user.toHex()
    }

    entity.dapp = event.params.dapp
    entity.status = "Deauthorized"

    entity.save()
}
