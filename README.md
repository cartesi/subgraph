# cartesi-subgraph
Cartesi subgraph

#### Running Instructions (local)
First of all, please make sure that you have the `pos-dlib` deployed to local network.
Replace the `lotteryAddress` and `prizeManagerAddress` fields of the `config/mainnet.json` file with the actual addresses on your local network.
Then run the following:
```
yarn
yarn prepare:mainnet
yarn codegen
yarn create-local
yarn deploy-local
```
