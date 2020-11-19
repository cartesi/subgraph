// Copyright 2020 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

export interface Schema {
    file: string;
}

export interface Source {
    address: string;
    abi: string;
    startBlock?: number;
}

export interface Abi {
    name: string;
    file: string;
}

export interface EventHandler {
    event: string;
    handler: string;
}

export interface CallHandler {
    function: string;
    handler: string;
}

export interface BlockFilter {
    kind: string;
}

export interface BlockHandler {
    function: string;
    filter?: BlockFilter;
}

export interface Mapping {
    kind: string;
    apiVersion: string;
    language: string;
    entities: string[];
    abis: Abi[];
    eventHandlers: EventHandler[];
    callHandlers: CallHandler[];
    blockHandlers: BlockHandler[];
    file: string;
}

export interface DataSource {
    kind: string;
    name: string;
    network: string;
    source: Source;
    mapping: Mapping;
}

export interface SubgraphManifest {
    specVersion: string;
    description?: string;
    repository?: string;
    schema?: Schema;
    dataSources?: DataSource[];
}
