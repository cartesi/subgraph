// Copyright 2021 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { BigInt } from "@graphprotocol/graph-ts"
import { Protocol } from "../generated/schema"
import * as summary from "./summary"

export function loadOrCreate(address: string, timestamp: BigInt): Protocol {
    let protocol = Protocol.load(address)
    if (protocol === null) {
        // increment total number of protocols
        let s = summary.loadOrCreate()
        s.totalProtocols++

        protocol = new Protocol(address)
        protocol.address = address
        protocol.version = s.totalProtocols // starts with 1 and goes on
        protocol.timestamp = timestamp
        protocol.totalChains = 0
        protocol.save()

        s.save()
    }
    return protocol!
}
