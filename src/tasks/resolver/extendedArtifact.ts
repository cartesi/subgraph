// Copyright 2021 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { ExtendedArtifact } from "hardhat-deploy/types"
import { Resolver } from "."

/**
 * Resolver from export artifact file
 */
export class ExtendedArtifactResolver implements Resolver {
    private artifact: ExtendedArtifact
    constructor(artifact: ExtendedArtifact) {
        this.artifact = artifact
    }

    async getAddress(contractName: string): Promise<string> {
        throw new Error(
            `ExtendedArtifactResolver cannot resolve address for contract ${contractName}`
        )
    }

    async getAbi(_contractName: string): Promise<any> {
        return this.artifact.abi
    }

    async getStartBlock(contractName: string): Promise<number | undefined> {
        throw new Error(
            `ExtendedArtifactResolver cannot resolve start block for contract ${contractName}`
        )
    }
}
