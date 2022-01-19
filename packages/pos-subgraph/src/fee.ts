// Copyright 2021 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { StakingPoolFee } from "../generated/schema"
import { FlatRateChanged } from "../generated/templates/FlatRateCommission/FlatRateCommission"
import { GasTaxChanged } from "../generated/templates/GasTaxCommission/GasTaxCommission"

export function handleFlatRateChanged(event: FlatRateChanged): void {
    let fee = StakingPoolFee.load(event.address.toHex())!
    fee.commission = event.params.newRate.toI32()
    fee.lastUpdated = event.block.timestamp
    fee.save()
}

export function handleGasTaxChanged(event: GasTaxChanged): void {
    let fee = StakingPoolFee.load(event.address.toHex())!
    let newGas = event.params.newGas
    fee.gas = newGas.isI32() ? newGas.toI32() : i32.MAX_VALUE
    fee.lastUpdated = event.block.timestamp
    fee.save()
}
