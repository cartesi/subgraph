import { Address } from "@graphprotocol/graph-ts"
import { Staker, Worker } from "../generated/schema"
import {
    Authorization,
    Deauthorization,
} from "../generated/WorkerAuthManager/WorkerAuthManagerImpl"

function checkOrCreate(user: Address, worker: Address, dapp: Address): Worker {
    let entity = Worker.load(worker.toHex())

    if (Staker.load(user.toHex()) === null) {
        let newUser = new Staker(user.toHex())
        newUser.save()
    }

    if (entity === null) {
        entity = new Worker(worker.toHex())
        entity.owner = user.toHex()
        entity.dapp = dapp
    }

    return entity!
}

export function handleAuthorization(event: Authorization): void {
    let entity = checkOrCreate(
        event.params.user,
        event.params.worker,
        event.params.dapp
    )
    entity.status = "Authorized"

    entity.save()
}

export function handleDeauthorization(event: Deauthorization): void {
    let entity = checkOrCreate(
        event.params.user,
        event.params.worker,
        event.params.dapp
    )
    entity.status = "Deauthorized"

    entity.save()
}
