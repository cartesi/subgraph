// Copyright 2023 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { InputAdded } from "../../../generated/InputBox/InputBox"
import { DApp, DAppFactory } from "../../../generated/schema"
import * as dashboard from "../dashboard"

export function handleInputAdded(event: InputAdded): void {
    const dapp = DApp.load(event.params.dapp.toHex())!

    dapp.inputCount++
    dapp.activityTimestamp = event.block.timestamp
    dapp.save()

    const factory = DAppFactory.load(dapp.factory)!
    factory.inputCount++
    factory.save()

    // load dashboard and increment total number of inputs
    const d = dashboard.loadOrCreate()
    d.inputCount++
    d.save()
}
