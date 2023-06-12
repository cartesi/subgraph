// Copyright 2023 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"

export const txHash = Bytes.fromHexString(
    "0x0000000000000000000000000000000000000000000000000000000000000001"
) as Bytes

export const dummyAddress = Address.fromString(
    "0x0000000000000000000000000000000000000001"
)

/**
 * represents the UTC datetime Thursday, August 26, 2021 05:46:40 PM
 */
export const txTimestamp = 1630000000
export const ZERO = BigInt.fromI32(0)

// UTILITIES

let factoryNumber = 100
let dappNumber = 200

export function nextDappAddress(): Address {
    const address = Address.fromString(
        "0x0000000000000000000000000000000000000" + dappNumber.toString()
    )
    dappNumber++
    return address
}

export function nextFactoryAddress(): Address {
    const address = Address.fromString(
        "0x0000000000000000000000000000000000000" + factoryNumber.toString()
    )

    factoryNumber++
    return address
}
