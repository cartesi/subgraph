import { HardhatUserConfig } from "hardhat/config";
import { HttpNetworkUserConfig } from "hardhat/types";

import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy";
import "./src/subgraph";

// read MNEMONIC from env variable
let mnemonic = process.env.MNEMONIC;

const infuraNetwork = (
    network: string,
    chainId?: number,
    gas?: number
): HttpNetworkUserConfig => {
    return {
        url: `https://${network}.infura.io/v3/${process.env.PROJECT_ID}`,
        chainId,
        gas,
        accounts: mnemonic ? { mnemonic } : undefined,
    };
};

const config: HardhatUserConfig = {
    networks: {
        hardhat: mnemonic ? { accounts: { mnemonic } } : {},
        localhost: {
            url: "http://localhost:8545",
            accounts: mnemonic ? { mnemonic } : undefined,
        },
        rinkeby: infuraNetwork("rinkeby", 4, 6283185),
        kovan: infuraNetwork("kovan", 42, 6283185),
        goerli: infuraNetwork("goerli", 5, 6283185),
        matic_testnet: {
            url: "https://rpc-mumbai.matic.today",
            chainId: 80001,
            accounts: mnemonic ? { mnemonic } : undefined,
        },
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
                enabled: true
            }
        }
    },
    paths: {
        artifacts: "artifacts",
        deploy: "deploy",
        deployments: "deployments",
    },
    external: {
        contracts: [
            {
                artifacts: "node_modules/@cartesi/util/artifacts",
                deploy: "node_modules/@cartesi/util/dist/deploy"
            },
            {
                artifacts: "node_modules/@cartesi/token/artifacts",
                deploy: "node_modules/@cartesi/token/dist/deploy"
            },
            {
                artifacts: "node_modules/@cartesi/pos/artifacts",
                deploy: "node_modules/@cartesi/pos/dist/deploy"
            },
        ],
        deployments: {
            localhost: [
                "node_modules/@cartesi/util/deployments/localhost",
                "node_modules/@cartesi/token/deployments/localhost",
                "node_modules/@cartesi/pos/deployments/localhost",
            ],
            ropsten: [
                "node_modules/@cartesi/util/deployments/ropsten",
                "node_modules/@cartesi/token/deployments/ropsten",
                "node_modules/@cartesi/pos/deployments/ropsten",
            ],
            rinkeby: [
                "node_modules/@cartesi/util/deployments/rinkeby",
                "node_modules/@cartesi/token/deployments/rinkeby",
                "node_modules/@cartesi/pos/deployments/rinkeby",
            ],
            kovan: [
                "node_modules/@cartesi/util/deployments/kovan",
                "node_modules/@cartesi/token/deployments/kovan",
                "node_modules/@cartesi/pos/deployments/kovan",
            ],
            goerli: [
                "node_modules/@cartesi/util/deployments/goerli",
                "node_modules/@cartesi/token/deployments/goerli",
                "node_modules/@cartesi/pos/deployments/goerli",
            ],
            matic_testnet: [
                "node_modules/@cartesi/util/deployments/matic_testnet",
                "node_modules/@cartesi/token/deployments/matic_testnet",
                "node_modules/@cartesi/pos/deployments/matic_testnet",
            ],
            bsc_testnet: [
                "node_modules/@cartesi/util/deployments/bsc_testnet",
                "node_modules/@cartesi/token/deployments/bsc_testnet",
                "node_modules/@cartesi/pos/deployments/bsc_testnet",
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
};

export default config;