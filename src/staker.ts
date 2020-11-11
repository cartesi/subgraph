import { Address, BigInt } from "@graphprotocol/graph-ts"
import { Staker } from "../generated/schema"
import { addStaker } from "./summary"

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
