declare namespace NodeJS {
    export interface ProcessEnv {
        /**
         * Limit for acceptable block number distance.
         */
        MONITOR_ALERT_THRESHOLD: string
        /**
         * Ethereum sepolia node rpc to connect.
         */
        RPC_URL_11155111: string
        /**
         * Ethereum mainnet node rpc to connect.
         */
        RPC_URL_1: string
        /**
         * alchemy Mainnet subgraph graphql endpoint.
         */
        ALCHEMY_MAINNET_URL: string
        /**
         *  chainstack Mainnet subgraph graphql endpoint.
         */
        CHAINSTACK_MAINNET_URL: string
        /**
         * chainstack sepolia subgraph graphql endpoint.
         */
        CHAINSTACK_SEPOLIA_URL: string
    }
}
