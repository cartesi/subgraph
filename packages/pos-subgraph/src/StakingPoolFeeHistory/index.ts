// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { StakingPoolFee, StakingPoolFeeHistory } from "../../generated/schema"
import { FlatRateChanged } from "../../generated/templates/FlatRateCommission/FlatRateCommission"

export class StakingPoolFeeType {
    static FLAT_RATE_COMMISSION: string = "FLAT_RATE_COMMISSION"
}

export function generateId(txHash: Bytes, fee: Address): string {
    return txHash.toHex() + "-" + fee.toHex()
}

function createEntry(
    id: string,
    feeType: string,
    pool: string,
    newValue: number,
    timestamp: BigInt,
    change: number
): StakingPoolFeeHistory {
    let history = new StakingPoolFeeHistory(id)
    history.pool = pool
    history.newValue = newValue as i32
    history.change = change as i32
    history.feeType = feeType
    history.timestamp = timestamp
    history.save()
    return history
}

export class StakingPoolFeeHistoryStore {
    static newflatRateChange(
        current: StakingPoolFee,
        evt: FlatRateChanged
    ): StakingPoolFeeHistory {
        let newValue = evt.params.newRate.toI32()
        // need to check the TypedMap since the autogenerated schema will blow because initially commission is null.
        // check: generated/schema line 420 column 12
        let isCommissionSet = current.isSet("commission")
        let currentCommission = isCommissionSet ? current.commission : 0
        // The way the smart contract are set the commission value in the first StakingPoolFee is null
        // So no change is really happening in this update it is just the first commission being set.
        let change = isCommissionSet == true ? newValue - currentCommission : 0

        return createEntry(
            generateId(evt.transaction.hash, evt.address),
            StakingPoolFeeType.FLAT_RATE_COMMISSION,
            current.pool,
            newValue,
            evt.block.timestamp,
            change
        )
    }
}
