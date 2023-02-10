// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { BigInt } from "@graphprotocol/graph-ts"

export enum Phase {
    InputAccumulation,
    AwaitingConsensus,
    AwaitingDispute,
}

export class Application {
    constructor(
        public readonly factoryVersion: string,
        public readonly factoryAddress: string,
        public readonly applicationAddress: string,
        public readonly inputDuration: i32,
        public readonly challengePeriod: i32,
        public readonly phase: Phase,
        public readonly deploymentTimestamp: BigInt,
        public readonly activityTimestamp: BigInt,
        public readonly inputCount: i32,
        public readonly currentEpoch: i32
    ) {}
}
