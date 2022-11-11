// Copyright 2021 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { Deployment } from "hardhat-deploy/types"
import { Resolver, hexToNumber } from "."

/**
 * Resolver from a specific deployment file
 */
export class DeploymentResolver implements Resolver {
    private deployment: Deployment

    constructor(deployment: Deployment) {
        this.deployment = deployment
    }

    async getAddress(contractName: string): Promise<string> {
        if (contractName.startsWith("0x")) {
            return contractName
        }
        console.log(
            `${contractName} resolved to ${this.deployment.address} by DeploymentResolver`
        )
        return this.deployment.address
    }

    async getAbi(_contractName: string): Promise<any> {
        return this.deployment.abi
    }

    async getStartBlock(contractName: string): Promise<number | undefined> {
        const blockNumber = this.deployment.receipt?.blockNumber
        if (blockNumber) {
            console.log(
                `Block number of ${contractName} resolved to ${blockNumber} by DeploymentResolver`
            )
        } else {
            console.log(`Block number undefined for contract ${contractName}`)
        }
        return hexToNumber(blockNumber)
    }
}
