// Copyright 2021 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { clearStore, test } from "matchstick-as"
import { BigInt } from "@graphprotocol/graph-ts"
import { handleWithdrawEvent } from "../../src/user"
import { User } from "../../generated/schema"
import { assertUser, createWithdrawEvent, ZERO } from "./utils"

test("withdraw(1000)", () => {
    let address = "0x0000000000000000000000000000000000000000"

    // create a user with 1200 releasing balance
    let user = new User(address)
    user.releasingBalance = BigInt.fromI32(1200)
    user.save()

    let amount = BigInt.fromI32(1000)
    let event = createWithdrawEvent(address, amount)
    handleWithdrawEvent(event)

    assertUser(address, ZERO, ZERO, ZERO, BigInt.fromI32(200), ZERO)

    clearStore()
})
