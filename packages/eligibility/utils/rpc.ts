import { ethers } from "ethers"
import { Block } from "../model/etherBlocks"

const { ETH_NODE } = process.env

const provider = new ethers.providers.JsonRpcProvider(ETH_NODE)

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getEthBlock(number: number): Promise<Block> {
    for (let attempts = 0; attempts < 5; attempts++) {
        try {
            const block = await provider.getBlock(number)
            return {
                hash: block.hash,
                number,
                timestamp: block.timestamp,
            }
        } catch (e) {
            console.warn(
                `Failed to query ${process.env.ETH_NODE} node. Trying again.`,
                (e as Error).toString()
            )
        }
        await sleep(5 * 1000) // 5 secs
    }
    throw new Error(
        `Could not retrieve the block ${number} from ${process.env.ETH_NODE} node.`
    )
}
