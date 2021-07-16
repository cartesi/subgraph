// Copyright 2021 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { DeploymentsExtension } from "hardhat-deploy/types"
import { Resolver, hexToNumber } from "."

/**
 * Resolve information from hardhat-deploy deployments API
 */
export class DeploymentsResolver implements Resolver {
    private deployments: DeploymentsExtension

    constructor(deployments: DeploymentsExtension) {
        this.deployments = deployments
    }

    async getAddress(contractName: string): Promise<string> {
        if (contractName.startsWith("0x")) {
            return contractName
        }
        const deployment = await this.deployments.get(contractName)
        console.log(
            `${contractName} resolved to ${deployment.address} by DeploymentsResolver`
        )
        return deployment.address
    }

    async getAbi(contractName: string): Promise<any> {
        const artifact = await this.deployments.getArtifact(contractName)
        if (artifact) {
            console.log(`Resolved ABI for ${contractName} with artifact`)
            return artifact.abi
        }
        const extendedArtifact = await this.deployments.getExtendedArtifact(
            contractName
        )
        if (extendedArtifact) {
            console.log(
                `Resolved ABI for ${contractName} with extendedArtifact`
            )
            return extendedArtifact.abi
        }
        const deployment = await this.deployments.getOrNull(contractName)
        if (deployment) {
            console.log(`Resolved ABI for ${contractName} with deployment`)
            return deployment.abi
        }
        throw new Error(
            `DeploymentsResolver cannot resolve abi for contract ${contractName}`
        )
    }

    async getStartBlock(contractName: string): Promise<number | undefined> {
        const deployment = await this.deployments.get(contractName)
        const blockNumber = deployment.receipt?.blockNumber
        if (blockNumber) {
            console.log(
                `Block number of ${contractName} resolved to ${blockNumber} by DeploymentsResolver`
            )
        } else {
            console.log(`Block number undefined for contract ${contractName}`)
        }
        return hexToNumber(blockNumber)
    }
}
