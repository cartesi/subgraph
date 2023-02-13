// Copyright 2023 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.
import { ApplicationCreated } from "../../../generated/CartesiDAppFactory-0.8/CartesiDAppFactory"
import { create } from "../Application"
import { Application } from "../Application/definitions"

// Factory version
const ZERO_EIGHT = "0.8"

export function handleApplicationCreated(event: ApplicationCreated): void {
    let app = new Application(
        ZERO_EIGHT,
        event.address.toHex(),
        event.params.application.toHex(),
        event.params.config.inputDuration.toI32(),
        event.params.config.challengePeriod.toI32(),
        event.block.timestamp,
        event.block.timestamp,
        0,
        0
    )

    create(app)
}
