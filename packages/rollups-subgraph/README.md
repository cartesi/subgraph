# Rollups Subgraph 

# Running Instruction

The first step is to run a local node, by following the instructions at the [docs](https://thegraph.com/docs/quick-start#local-development).
You can either run a node connected to a local ganache private network, or a node connected to a testnet (like ropsten) or mainnet.

The following commands illustrate the scenario to deploy a graph from information available at `goerli` testnet. So you also need to run the node connected to `goerli`.

Some of the steps require a [Infura](https://infura.io) application id to be specified as an environment variable called `PROJECT_ID`.

```
yarn
yarn prepare:goerli
yarn codegen subgraph.goerli.yaml
yarn build subgraph.goerli.yaml
yarn create:localhost
yarn deploy:localhost
```

## Schema

Database schema is defined at `schema.graphql`.

An ER diagram can be generated using the [erd tool](https://github.com/BurntSushi/erd), by running `erd -i schema.er -o schema.png` (on Mac) with the provided `schema.er` file. The following command generates a PNG file.

## Testing

The [matchstick framework](https://github.com/LimeChain/matchstick) can be used to run unit tests of the mapping code with mock data. This is very useful because it avoids the deployment and sync cycle, which can take a lot of time.

Matchstick basically works by running the WASM mapping code with a rust runtime that can inject arbitrary payloads to the mapping handler functions. A set of utility functions is provided by the `matchstick-as` npm library.

This [article](https://limechain.tech/blog/matchstick-what-it-is-and-how-to-use-it/) contains further information about how it works.

## Contributing

Thank you for your interest in Cartesi! Head over to our [Contributing Guidelines](CONTRIBUTING.md) for instructions on how to sign our Contributors Agreement and get started with
Cartesi!

Please note we have a [Code of Conduct](CODE_OF_CONDUCT.md), please follow it in all your interactions with the project.

## Authors

-   _Danilo Tuler_
-   _Alexander Bai_

## License

The repository and all contributions are licensed under
[APACHE 2.0](https://www.apache.org/licenses/LICENSE-2.0). Please review our [LICENSE](LICENSE) file.
