import { BigInt } from "@graphprotocol/graph-ts"
import { Staker } from "../generated/schema"
import { Stake, Unstake } from "../generated/StakingImpl/StakingImpl"

export function handleStake(event: Stake): void {
    let entity = Staker.load(event.address.toHex())

    if (entity === null) {
        entity = new Staker(event.address.toHex())
    }

    if (entity.maturation.toI32() < Date.now()) {
        entity.maturation = BigInt.fromI32(0)
        entity.stakedBalance = entity.stakedBalance + entity.maturingBalance
        entity.maturingBalance = BigInt.fromI32(0)
    }

    entity.maturingBalance = entity.maturingBalance + event.params._amount
    entity.maturation = event.params._maturationDate

    entity.save()
}

export function handleUnstake(event: Unstake): void {
    let entity = Staker.load(event.address.toHex())

    if (entity === null) {
        entity = new Staker(event.address.toHex())
    }

    entity.stakedBalance = entity.stakedBalance - event.params._amount

    entity.save()
}
