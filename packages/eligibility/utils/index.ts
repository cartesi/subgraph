import { EtherBlocks } from "../model/etherBlocks"
import { BlockSelectorContextState } from "../model/blockSelectorContext"

import { BlockSelector } from "../BlockSelector"
import { BlockSelector as BlockSelectorV1 } from "../BlockSelectorV1"

export function selectBlockSelector(
    blockSelectorAddress: string,
    blocks: EtherBlocks,
    state: BlockSelectorContextState
): BlockSelector | BlockSelectorV1 {
    let blockSelector
    if (
        blockSelectorAddress.toLowerCase() ===
        "0x98d951e9b0c0bb180f1b3ed40dde6e1b1b521cc1"
    ) {
        blockSelector = new BlockSelector(state, blocks)
    } else if (
        blockSelectorAddress.toLowerCase() ===
        "0x742fcf5ba052d9912499acf208d5410ae31d49ac"
    ) {
        blockSelector = new BlockSelectorV1(state, blocks)
    } else {
        throw new Error(
            `The BlockSelector Address provided is not yet covered ${blockSelectorAddress}`
        )
    }

    return blockSelector
}
