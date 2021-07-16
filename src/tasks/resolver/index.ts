// Copyright 2021 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

export interface Resolver {
    /**
     * Resolves the address of a contract by its name
     * @param contractName name of contract
     */
    getAddress(contractName: string): Promise<string>

    /**
     * Extract the ABI object of a contract by its name
     * @param contractName name of contract
     */
    getAbi(contractName: string): any

    /**
     * Returns the block on which the contract was deployed
     * @param contractName name of contract
     */
    getStartBlock(contractName: string): Promise<number | undefined>
}

export const hexToNumber = (
    value: string | number | undefined
): number | undefined => {
    if (typeof value == "string") {
        return parseInt(value, 16)
    }
    return value
}

export { DeploymentResolver } from "./deployment"
export { DeploymentsResolver } from "./deployments"
export { ExportResolver } from "./export"
export { ExtendedArtifactResolver } from "./extendedArtifact"
