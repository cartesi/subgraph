# cartesi-subgraph

Cartesi Subgraph

#### Running Instructions

The first step is to run a local node, by following the instructions at the [docs](https://thegraph.com/docs/quick-start#local-development).
You can either run a node connected to a local ganache private network, or a node connected to a testnet (like ropsten) or mainnet.

The following commands illustrate the scenario to deploy a graph from information available at `goerli` testnet. So you also need to run the node connected to `goerli`.

Some of the steps require a [Infura](https://infura.io) application id to be specified as an environment variable called `PROJECT_ID`.

```
yarn
yarn prepare:goerli
yarn codegen
yarn create-local
yarn deploy-local
```

# Contributing

Thank you for your interest in Cartesi! Head over to our [Contributing Guidelines](CONTRIBUTING.md) for instructions on how to sign our Contributors Agreement and get started with
Cartesi!

Please note we have a [Code of Conduct](CODE_OF_CONDUCT.md), please follow it in all your interactions with the project.

# Authors

* *Danilo Tuler*
* *Alexander Bai*

# License

The repository and all contributions are licensed under
[APACHE 2.0](https://www.apache.org/licenses/LICENSE-2.0). Please review our [LICENSE](LICENSE) file.
