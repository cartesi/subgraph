import { BigInt } from "@graphprotocol/graph-ts"
import { User } from "../../generated/schema"

let dateOne = 1618250372 // Mon, 12 Apr 2021 17:59:32 GMT
let dateTwo = 1622893453 // Sat, 05 Jun 2021 11:44:13 GMT
/**
 * Create a user with some default values
 * @param address
 */
export function buildUser(address: string): User {
    // create a user with 1200 staked
    let user = new User(address)
    user.balance = BigInt.fromI32(0)
    user.stakedBalance = BigInt.fromI32(0)
    user.releasingBalance = BigInt.fromI32(0)
    user.releasingTimestamp = BigInt.fromI32(0)
    user.maturingBalance = BigInt.fromI32(0)
    user.maturingTimestamp = BigInt.fromI32(0)
    user.totalBlocks = 0
    user.totalReward = BigInt.fromI32(0)

    return user
}
