import { Address, BigInt } from "@graphprotocol/graph-ts"
import { Staker } from "../generated/schema"
import { Stake, Unstake } from "../generated/StakingImpl/StakingImpl"
import { addStaker, addStake, removeStake } from "./summary"

export function loadOrCreate(address: Address): Staker {
    let staker = Staker.load(address.toHex())

    if (staker == null) {
        staker = new Staker(address.toHex())
        staker.stakedBalance = BigInt.fromI32(0)
        staker.maturingBalance = BigInt.fromI32(0)
        staker.maturation = BigInt.fromI32(0)
        staker.totalTickets = BigInt.fromI32(0)
        staker.save()
        addStaker()
    }

    return staker!
}

export function handleStake(event: Stake): void {
    let staker = loadOrCreate(event.params._address)
    staker.stakedBalance = staker.stakedBalance.plus(event.params._amount)
    staker.save()
    addStake(event.params._amount)
}

export function handleUnstake(event: Unstake): void {
    let staker = loadOrCreate(event.params._address)
    staker.stakedBalance = staker.stakedBalance.minus(event.params._amount)
    staker.save()
    removeStake(event.params._amount)
}
