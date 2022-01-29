import { User } from "./model/user"
import { BlockSelector } from "./BlockSelector"

import { BlockSelector as BlockSelectorV1 } from "./BlockSelectorV1"
import { BlockSelectorContextState } from "./model/blockSelectorContext"

import { selectBlockSelector } from "./utils"
import { EtherBlocks } from "./model/etherBlocks"

export class UserProcessor {
    model: User
    selector: BlockSelector | BlockSelectorV1
    bscState: BlockSelectorContextState

    constructor(
        userModel: User,
        bscState: BlockSelectorContextState,
        blockSelectorAddress: string,
        blocks: EtherBlocks
    ) {
        this.model = userModel
        this.bscState = bscState
        this.selector = selectBlockSelector(
            blockSelectorAddress,
            blocks,
            bscState
        )
    }

    processBlock(blockNumber: number) {
        if (
            blockNumber <
            Math.max(
                this.model.getLowerLimitStateRange(),
                this.bscState.getLowerLimitStateRange()
            )
        ) {
            return
        }

        this.model.eligibility.push(
            this.model.getStakedBalance(blockNumber),
            this.bscState.getContext(blockNumber).eth_block_checkpoint, //@dev change to actual blocknumber used
            this.selector.canProduceBlock(this.model, blockNumber),
            blockNumber
        )
    }

    async save() {
        //save eligibilities processed so far
        await this.model.eligibility.saveAndReset()
    }
}
