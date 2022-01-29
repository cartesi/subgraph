import { isMainThread, threadId } from "worker_threads"
import { config } from "dotenv"
config()
import { getDb, getDeployment } from "./db"
import { Range } from "./utils/range"
import { EtherBlocksClass, EtherBlocks, Block } from "./model/etherBlocks"
import { loadUsersByRange } from "./model/user"

import { BlockSelectorContextState } from "./model/blockSelectorContext"
import { EligibilityProcess } from "./model/process"
import { UserProcessor } from "./user"
import { User } from "./model/user"

export async function processEligibility(
    blockSelectorAddress: string,
    chainId: number,
    saveProgress: number,
    userList?: User[],
    blocks?: EtherBlocks
): Promise<void> {
    const db = await getDb()
    const BLOCKS = blocks || new EtherBlocksClass(db)
    let latestBlock = await BLOCKS.latestBlock()
    let lastBlock = 0
    // chose what type/version of blockselector will be used
    let blockSelectorState = new BlockSelectorContextState(
        blockSelectorAddress,
        chainId,
        latestBlock,
        db
    )

    await blockSelectorState.loadContext()
    const deployment = await getDeployment()
    const eProcess = new EligibilityProcess(
        blockSelectorState.id,
        deployment.deploymentHash,
        deployment.subgraphName,
        db
    )
    await eProcess.loadOrCreate()

    const processRange = new Range(
        Math.max(
            blockSelectorState.getLowerLimitStateRange(),
            eProcess.lastBlock!
        ),
        blockSelectorState.getUpperLimitStateRange()
    )

    const userModels = userList
        ? userList
        : await loadUsersByRange(
              processRange,
              BLOCKS,
              blockSelectorState.id,
              db
          )

    const users = userModels.map(
        (model) =>
            new UserProcessor(
                model,
                blockSelectorState,
                blockSelectorAddress,
                BLOCKS
            )
    )
    // when working with several processes this will shorten the work time wasted
    const oldestSavedBlockForUsers = users.reduce((blockNum: number, user) => {
        return Math.min(blockNum, user.model.getLowerLimitStateRange())
    }, latestBlock)

    processRange.start = Math.max(processRange.start, oldestSavedBlockForUsers)

    return new Promise((resolve) => {
        const onBlock = async (block: Block) => {
            // console.log(`Processing Block ${block.number}`)
            users.map((user) => user.processBlock(block.number))

            if (
                block.number % saveProgress === 0 &&
                block.number !== processRange.start
            ) {
                // at every `saveProgress` blocks we check point the process
                console.log(
                    `[${threadId}] Saving progress at block ${block.number}`
                )
                // @dev this was not working locally; maybe DB is not strong enough?
                // await Promise.all(users.map((user) => user.save()))
                for (let i = 0; i < users.length; i++) await users[i].save()

                if (isMainThread) await eProcess.save(block.number)
            }
            lastBlock = block.number
        }

        let before = Date.now()
        const onEnd = async () => {
            console.log(`it took ${(Date.now() - before) / 1000} seconds `)
            // save any left progress
            users.map((user) => user.save())
            if (isMainThread) await eProcess.save(lastBlock)
            await db.destroy()
            resolve()
        }
        BLOCKS.startStream(processRange, onBlock, onEnd)
    })
}
