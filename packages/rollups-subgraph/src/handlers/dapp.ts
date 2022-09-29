// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { CartesiDAppInput, CartesiDAppRollups } from "../../generated/templates"
import { ApplicationCreated } from "../../generated/CartesiDAppFactory/CartesiDAppFactory"
import { DApp, DAppFactory } from "../../generated/schema"

enum Phase {
    InputAccumulation,
    AwaitingConsensus,
    AwaitingDispute,
}

export function handleApplicationCreated(event: ApplicationCreated): void {
    // load the factory and update stats
    let factory = DAppFactory.load(event.address)
    if (!factory) {
        factory = new DAppFactory(event.address)
        factory.dappCount = 0
        factory.inputCount = 0
    }
    factory.dappCount++
    factory.save()

    // create DApp
    const dapp = new DApp(event.params.application)
    dapp.inputDuration = event.params.config.inputDuration.toI32()
    dapp.challengePeriod = event.params.config.challengePeriod.toI32()
    dapp.phase = Phase.InputAccumulation
    dapp.timestamp = event.block.timestamp
    dapp.inputCount = 0
    dapp.currentEpoch = 0
    dapp.factory = event.address
    dapp.save()

    // instantiate templates
    CartesiDAppInput.create(event.params.application)
    CartesiDAppRollups.create(event.params.application)
}
