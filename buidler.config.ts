import fs from "fs";
import { Wallet } from "@ethersproject/wallet";
import { BuidlerConfig, usePlugin } from "@nomiclabs/buidler/config";
import { HttpNetworkConfig } from "@nomiclabs/buidler/types";

usePlugin("@nomiclabs/buidler-ethers");
usePlugin("buidler-deploy");
require("./src/subgraph");

// read MNEMONIC from file or from env variable
let mnemonic = process.env.MNEMONIC;
try {
    mnemonic = fs
        .readFileSync(process.env.MNEMONIC_PATH || ".mnemonic")
        .toString();
} catch (e) {}

// create a Buidler EVM account array from mnemonic
const mnemonicAccounts = (n = 10) => {
    return mnemonic
        ? Array.from(Array(n).keys()).map((i) => {
              const wallet = Wallet.fromMnemonic(
                  mnemonic as string,
                  `m/44'/60'/0'/0/${i}`
              );
              return {
                  privateKey: wallet.privateKey,
                  balance: "1000000000000000000000",
              };
          })
        : undefined;
};

const infuraNetwork = (
    network: string,
    chainId?: number,
    gas?: number
): HttpNetworkConfig => {
    return {
        url: `https://${network}.infura.io/v3/${process.env.PROJECT_ID}`,
        chainId,
        gas,
        accounts: mnemonic ? { mnemonic } : undefined,
    };
};

const config: BuidlerConfig = {
    networks: {
        buidlerevm: mnemonic ? { accounts: mnemonicAccounts() } : {},
        localhost: {
            url: "http://localhost:8545",
            accounts: mnemonic ? { mnemonic } : undefined,
        },
        ropsten: infuraNetwork("ropsten", 3, 3283185),
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
    solc: {
        version: "0.7.1",
        optimizer: {
            enabled: true,
        },
    },
    paths: {
        artifacts: "artifacts",
        deploy: "deploy",
        deployments: "deployments",
    },
    external: {
        artifacts: [
            "node_modules/@cartesi/util/artifacts",
            "node_modules/@cartesi/token/artifacts",
            "node_modules/@cartesi/pos/artifacts",
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
