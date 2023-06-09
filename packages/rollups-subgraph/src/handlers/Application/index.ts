// // Copyright 2022 Cartesi Pte. Ltd.

// // Licensed under the Apache License, Version 2.0 (the "License"); you may not
// // use this file except in compliance with the License. You may obtain a copy
// // of the license at http://www.apache.org/licenses/LICENSE-2.0

// // Unless required by applicable law or agreed to in writing, software
// // distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// // WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// // License for the specific language governing permissions and limitations
// // under the License.

import { CartesiDAppInput } from "../../../generated/templates"
import { DApp, DAppFactory } from "../../../generated/schema"
import { Address } from "@graphprotocol/graph-ts"
import * as dashboard from "../dashboard"
import { Application } from "./definitions"
import { DAppStatus } from "../DAppStatus"

export function create(app: Application): void {
    let factory = loadOrCreateDAppFactory(
        app.factoryAddress,
        app.factoryVersion
    )

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
    const dapp = new DApp(app.applicationAddress)
    dapp.inputDuration = app.inputDuration
    dapp.challengePeriod = app.challengePeriod
    dapp.deploymentTimestamp = app.deploymentTimestamp
    dapp.activityTimestamp = app.activityTimestamp
    dapp.inputCount = app.inputCount
    dapp.currentEpoch = app.currentEpoch
    dapp.factory = app.factoryAddress
    dapp.status = DAppStatus.CREATED_BY_FACTORY
    dapp.save()

    // Create the CartesiDAppInput and CartesiDAppRollups templates
    createTemplates(app.applicationAddress)
}

function createTemplates(address: string): void {
    let application = Address.fromString(address)
    // instantiate templates
    CartesiDAppInput.create(application)
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
