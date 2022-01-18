// Copyright 2021 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { Export } from "hardhat-deploy/types"
import { Resolver } from "."

/**
 * Resolver from a deployment export file containing all deployed contracts.
 */
export class ExportResolver implements Resolver {
    private exportFile: Export

    constructor(exportFile: Export) {
        this.exportFile = exportFile
    }

    async getAddress(contractName: string): Promise<string> {
        if (contractName.startsWith("0x")) {
            return contractName
        }
        const contract = this.exportFile.contracts[contractName]
        console.log(
            `${contractName} resolved to ${contract.address} by ExportResolver`
        )
        return contract.address
    }

    async getAbi(contractName: string): Promise<any> {
        const contract = this.exportFile.contracts[contractName]
        if (!contract) {
            throw new Error(
                `ExportResolver cannot resolve abi for contract ${contractName}`
            )
        }
        return contract.abi
    }

    async getStartBlock(_contractName: string): Promise<number | undefined> {
        console.log(`Block number undefined for contract ${_contractName}`)
        return undefined
    }
}
