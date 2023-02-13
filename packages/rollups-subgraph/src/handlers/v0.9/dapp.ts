// Copyright 2023 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { ApplicationCreated } from "../../../generated/CartesiDAppFactory-0.9/CartesiDAppFactory"
import { DApp, DAppFactory } from "../../../generated/schema"
import * as dashboard from "../dashboard"

const ZERO_NINE = "0.9"

export function handleApplicationCreated(event: ApplicationCreated): void {
    let factory = loadOrCreateDAppFactory(event.address.toHex(), ZERO_NINE)

    let d = dashboard.loadOrCreate()

    if (factory.dashboard == null) {
        factory.dashboard = d.id
        // increase total number of factories.
        d.factoryCount++
    }

    // increase overall number of dapps created
    d.dappCount++
    d.save()

    factory.dappCount++
    factory.save()

    // Create and save a new Dapp
    let applicationAddress = event.params.application.toHex()
    const dapp = new DApp(applicationAddress)
    dapp.inputDuration = 0
    dapp.challengePeriod = 0
    dapp.deploymentTimestamp = event.block.timestamp
    dapp.activityTimestamp = event.block.timestamp
    dapp.inputCount = 0
    dapp.currentEpoch = 0
    dapp.factory = event.address.toHex()
    dapp.save()
}

function loadOrCreateDAppFactory(
    address: string,
    version: string
): DAppFactory {
    let factory = DAppFactory.load(address)
    if (!factory) {
        factory = new DAppFactory(address)
        factory.dappCount = 0
        factory.inputCount = 0
        factory.version = version
    }

    return factory
}
