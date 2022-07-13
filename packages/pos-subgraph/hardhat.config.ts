// Copyright 2021 Cartesi Pte. Ltd.

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
        ropsten: infuraNetwork("ropsten", 3, 6283185),
        rinkeby: infuraNetwork("rinkeby", 4, 6283185),
        kovan: infuraNetwork("kovan", 42, 6283185),
        goerli: infuraNetwork("goerli", 5, 6283185),
        matic_testnet: infuraNetwork("polygon-mumbai", 80001),
        bsc_testnet: {
            url: "https://data-seed-prebsc-1-s1.binance.org:8545",
            chainId: 97,
            accounts: mnemonic ? { mnemonic } : undefined,
        },
    },
    solidity: {
        version: "0.7.4",
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
                    "@cartesi/util",
                    "export/artifacts"
                ),
                deploy: resolveModulePath("@cartesi/util", "dist/deploy"),
            },
            {
                artifacts: resolveModulePath(
                    "@cartesi/token",
                    "export/artifacts"
                ),
                deploy: resolveModulePath("@cartesi/token", "dist/deploy"),
            },
            {
                artifacts: resolveModulePath(
                    "@cartesi/pos",
                    "export/artifacts"
                ),
                deploy: resolveModulePath("@cartesi/pos", "dist/deploy"),
            },
            {
                artifacts: resolveModulePath(
                    "@cartesi/staking-pool",
                    "export/artifacts"
                ),
                deploy: resolveModulePath(
                    "@cartesi/staking-pool",
                    "dist/deploy"
                ),
            },
        ],
        deployments: {
            localhost: [
                resolveModulePath("@cartesi/util", "deployments/localhost"),
                resolveModulePath("@cartesi/token", "deployments/localhost"),
                resolveModulePath("@cartesi/pos", "deployments/localhost"),
                resolveModulePath(
                    "@cartesi/staking-pool",
                    "deployments/localhost"
                ),
            ],
            mainnet: [
                resolveModulePath("@cartesi/util", "deployments/mainnet"),
                resolveModulePath("@cartesi/token", "deployments/mainnet"),
                resolveModulePath("@cartesi/pos", "deployments/mainnet"),
                resolveModulePath(
                    "@cartesi/staking-pool",
                    "deployments/mainnet"
                ),
            ],
            ropsten: [
                resolveModulePath("@cartesi/util", "deployments/ropsten"),
                resolveModulePath("@cartesi/token", "deployments/ropsten"),
                resolveModulePath("@cartesi/pos", "deployments/ropsten"),
                resolveModulePath(
                    "@cartesi/staking-pool",
                    "deployments/ropsten"
                ),
            ],
            rinkeby: [
                resolveModulePath("@cartesi/util", "deployments/rinkeby"),
                resolveModulePath("@cartesi/token", "deployments/rinkeby"),
                resolveModulePath("@cartesi/pos", "deployments/rinkeby"),
                resolveModulePath(
                    "@cartesi/staking-pool",
                    "deployments/rinkeby"
                ),
            ],
            kovan: [
                resolveModulePath("@cartesi/util", "deployments/kovan"),
                resolveModulePath("@cartesi/token", "deployments/kovan"),
                resolveModulePath("@cartesi/pos", "deployments/kovan"),
                resolveModulePath("@cartesi/staking-pool", "deployments/kovan"),
            ],
            goerli: [
                resolveModulePath("@cartesi/util", "deployments/goerli"),
                resolveModulePath("@cartesi/token", "deployments/goerli"),
                resolveModulePath("@cartesi/pos", "deployments/goerli"),
                resolveModulePath(
                    "@cartesi/staking-pool",
                    "deployments/goerli"
                ),
            ],
            matic_testnet: [
                resolveModulePath("@cartesi/util", "deployments/matic_testnet"),
                resolveModulePath(
                    "@cartesi/token",
                    "deployments/matic_testnet"
                ),
                resolveModulePath("@cartesi/pos", "deployments/matic_testnet"),
                resolveModulePath(
                    "@cartesi/staking-pool",
                    "deployments/matic_testnet"
                ),
            ],
            bsc_testnet: [
                resolveModulePath("@cartesi/util", "deployments/bsc_testnet"),
                resolveModulePath("@cartesi/token", "deployments/bsc_testnet"),
                resolveModulePath("@cartesi/pos", "deployments/bsc_testnet"),
                resolveModulePath(
                    "@cartesi/staking-pool",
                    "deployments/bsc_testnet"
                ),
            ],
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        alice: {
            default: 0,
        },
        bob: {
            default: 1,
        },
    },
}

export default config
