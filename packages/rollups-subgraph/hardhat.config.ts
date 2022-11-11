// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import path from "path"
import { HardhatUserConfig } from "hardhat/config"
import { HttpNetworkUserConfig } from "hardhat/types"

import "@nomiclabs/hardhat-ethers"
import "hardhat-deploy"
import "./src/tasks/subgraph"

// read MNEMONIC and PROJECT_ID from env variable
const { MNEMONIC: mnemonic, PROJECT_ID: projectId } = process.env as any

const resolveModulePath = (
    moduleName: string,
    relativePath: string
): string => {
    const dir = path.dirname(require.resolve(`${moduleName}/package.json`))
    return path.join(dir, relativePath)
}

const infuraNetwork = (
    network: string,
    chainId?: number,
    gas?: number
): HttpNetworkUserConfig => {
    return {
        url: `https://${network}.infura.io/v3/${projectId}`,
        chainId,
        gas,
        accounts: mnemonic ? { mnemonic } : undefined,
    }
}

const config: HardhatUserConfig = {
    networks: {
        hardhat: mnemonic ? { accounts: { mnemonic } } : {},
        localhost: {
            url: "http://localhost:8545",
            accounts: mnemonic ? { mnemonic } : undefined,
        },
        mainnet: infuraNetwork("mainnet", 1, 6283185),
        goerli: infuraNetwork("goerli", 5, 6283185),
    },
    solidity: {
        version: "0.8.13",
        settings: {
            optimizer: {
                enabled: true,
            },
        },
    },
    paths: {
        artifacts: "artifacts",
        deploy: "deploy",
        deployments: "deployments",
    },
    external: {
        contracts: [
            {
                artifacts: resolveModulePath(
                    "@cartesi/rollups",
                    "export/artifacts"
                ),
                deploy: resolveModulePath("@cartesi/rollups", "dist/deploy"),
            },
        ],
        deployments: {
            localhost: [
                resolveModulePath("@cartesi/rollups", "deployments/localhost"),
            ],
            mainnet: [
                resolveModulePath("@cartesi/rollups", "deployments/mainnet"),
            ],
            goerli: [
                resolveModulePath("@cartesi/rollups", "deployments/goerli"),
            ],
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
}

export default config
