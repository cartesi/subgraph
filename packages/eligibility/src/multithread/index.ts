import { config } from "dotenv"
config()
import { getDb, getDeployment } from "../db"

import { EtherBlocksClass } from "../model/etherBlocks"
import { EligibilityProcess } from "../model/process"

import { PoolWorker } from "./poolWorker"
import { findUsers } from "../model/user"

export async function processEligibility(
    blockSelectorAddress: string,
    chainId: number,
    saveProgress: number,
    threadsCount: number
): Promise<void> {
    const db = await getDb()
    const BLOCKS = new EtherBlocksClass(db)
    const latestBlock = await BLOCKS.latestBlock()
    const deployment = await getDeployment()
    const eProcess = new EligibilityProcess(
        `${blockSelectorAddress.toLowerCase()}-${chainId}`,
        deployment.deploymentHash,
        deployment.subgraphName,
        db
    )
    let before = Date.now()

    let users = await findUsers(db)
    const chunk_size = Math.ceil(users.length / threadsCount)
    let workers = []
    for (let i = 0; i < users.length; i += chunk_size) {
        workers.push(
            new PoolWorker(
                blockSelectorAddress,
                chainId,
                latestBlock,
                users.slice(i, i + chunk_size),
                saveProgress
            )
        )
    }

    let jobsPromises = workers.map((w) => w.run())
    await Promise.all(jobsPromises) //wait for all jobs to be done

    console.info(`all done`)
    console.log(`it took ${(Date.now() - before) / 1000} seconds `)
    // process is finished, save current progress
    await eProcess.save(latestBlock)
    await db.destroy()
}
