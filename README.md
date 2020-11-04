# cartesi-subgraph

Cartesi Subgraph

#### Running Instructions

The first step is to run a local node, by following the instructions at the [docs](https://thegraph.com/docs/quick-start#local-development).
You can either run a node connected to a local ganache private network, or a node connected to a testnet (like ropsten) or mainnet.

The following commands illustrate the scenario to deploy a graph from information available at `ropsten` testnet. So you also need to run the node connected to `ropsten`.

Some of the steps require a [Infura](https://infura.io) application id to be specified as an environment variable called `PROJECT_ID`.

```
yarn
yarn prepare:goerli
yarn codegen
yarn create-local
yarn deploy-local
```
