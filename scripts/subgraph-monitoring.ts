import { gql, request } from "graphql-request"
import type { Hex } from "viem"
import { createPublicClient, http } from "viem"
import { mainnet, sepolia } from "viem/chains"

const threshold = process.env.MONITOR_ALERT_THRESHOLD ?? "50"
const sepoliaRpcUrl = process.env.RPC_URL_11155111
const mainnetRpcUrl = process.env.RPC_URL_1
const alchemyUrl = process.env.ALCHEMY_MAINNET_URL ?? ""
const chainstackUrl = process.env.CHAINSTACK_MAINNET_URL ?? ""
const sepoliaChainstackUrl = process.env.CHAINSTACK_SEPOLIA_URL ?? ""
const blockDiffLimit = BigInt(threshold)

const mainnetClient = createPublicClient({
    chain: mainnet,
    transport: http(mainnetRpcUrl),
})
const sepoliaClient = createPublicClient({
    transport: http(sepoliaRpcUrl),
    chain: sepolia,
})

interface Meta {
    block: {
        hash: Hex
        number: number
    }
    deployment: string
    hasIndexingErrors: boolean
}

interface MetaQuery {
    _meta: Meta
}

const query = gql`
    query _meta {
        _meta {
            block {
                hash
                number
            }

            deployment
            hasIndexingErrors
        }
    }
`

const absBigInt = (n: bigint) => {
    if (typeof n !== "bigint") {
        throw new TypeError("Input must be a BigInt.")
    }
    return n < 0n ? -n : n
}

async function main() {
    const mainnetPromises = Promise.all([
        request<MetaQuery>(alchemyUrl, query),
        request<MetaQuery>(chainstackUrl, query),
        mainnetClient.getBlockNumber(),
    ])

    const sepoliaPromises = Promise.all([
        request<MetaQuery>(sepoliaChainstackUrl, query),
        sepoliaClient.getBlockNumber(),
    ])

    const [mainnetResults, sepoliaResults] = await Promise.all([
        mainnetPromises,
        sepoliaPromises,
    ])

    const [alchemyQuery, chainstackQuery, blockNumber] = mainnetResults
    const [sepoliaChainstackQuery, sepoliaBlockNumber] = sepoliaResults

    const alchemyBlockNumber = alchemyQuery?._meta?.block.number ?? 0
    const chainstackBlockNumber = chainstackQuery?._meta?.block.number ?? 0
    const sepoliaChainstackBlockNumber =
        sepoliaChainstackQuery?._meta?.block.number ?? 0

    const alchemyDiff = BigInt(alchemyBlockNumber) - blockNumber
    const chainstackDiff = BigInt(chainstackBlockNumber) - blockNumber
    const sepoliaChainstackDiff =
        BigInt(sepoliaChainstackBlockNumber) - sepoliaBlockNumber

    console.log(`MAINNET`)
    console.log(`\tblockNumber: ${blockNumber}`)
    console.log(`\talchemy: ${alchemyBlockNumber} diff: ${alchemyDiff}`)
    console.log(
        `\tchainstack: ${chainstackBlockNumber} diff: ${chainstackDiff}`
    )

    console.log(`SEPOLIA`)
    console.log(`\tblockNumber: ${sepoliaBlockNumber}`)
    console.log(
        `\tchainstack: ${sepoliaChainstackBlockNumber} diff: ${sepoliaChainstackDiff}`
    )

    const isAboveThreshold = [
        alchemyDiff,
        chainstackDiff,
        sepoliaChainstackDiff,
    ].some((diff) => absBigInt(diff) > blockDiffLimit)

    // if (isAboveThreshold) {
    //     process.exit(1)
    // } else {
    //     process.exit(0)
    // }

    process.exit(1)
}

main()
