// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { ApplicationCreated } from "../../../generated/CartesiDAppFactory/CartesiDAppFactory"
import { Application, Phase } from "../Application/definitions"
import { create } from "../Application"

// Factory version
const ZERO_SIX = "0.6"

export function handleApplicationCreated(event: ApplicationCreated): void {
    let app = new Application(
        ZERO_SIX,
        event.address.toHex(),
        event.params.application.toHex(),
        event.params.config.inputDuration.toI32(),
        event.params.config.challengePeriod.toI32(),
        Phase.InputAccumulation,
        event.block.timestamp,
        event.block.timestamp,
        0,
        0
    )

    create(app)
}
