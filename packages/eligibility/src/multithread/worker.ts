import { parentPort, MessagePort, threadId, workerData } from "worker_threads"
import { BlockSelectorContextState } from "../model/blockSelectorContext"
import { getDb, KnexDB } from "../db"

import { loadUser, User } from "../model/user"
import { EtherBlocks, EtherBlocksClass } from "../model/etherBlocks"

import { processEligibility } from "../index"

export interface WorkerJob {
    start: boolean
}

export interface WorkerJobReply {
    success: boolean
}

export class Worker {
    blockSelectorAddress: string
    chainId: number
    latestBlock: number
    blockSelectorState: BlockSelectorContextState
    localPort: MessagePort
    etherBlocks: EtherBlocks
    userAddresses: string[]
    saveProgress: number
    db: KnexDB

    constructor(db: KnexDB) {
        const {
            blockSelectorAddress,
            chainId,
            latestBlock,
            port,
            users,
            saveProgress,
        } = workerData

        this.userAddresses = users
        this.saveProgress = saveProgress | (10 * 1000)
        this.blockSelectorAddress = blockSelectorAddress
        this.chainId = chainId
        this.latestBlock = latestBlock
        this.db = db
        this.etherBlocks = new EtherBlocksClass(db)
        this.blockSelectorState = new BlockSelectorContextState(
            blockSelectorAddress,
            chainId,
            latestBlock,
            db
        )
        this.localPort = port

        console.info(`worker ${threadId} is alive`)
    }
    async init() {
        // make the handler available for work jobs
        return this.handleJob.bind(this)
    }

    async loadUsers(): Promise<User[]> {
        const users = await Promise.all(
            this.userAddresses.map((address) =>
                loadUser(
                    address,
                    this.etherBlocks,
                    this.blockSelectorState.id,
                    this.db
                )
            )
        )
        return users
    }

    async handleJob(job: WorkerJob) {
        const users = await this.loadUsers()

        console.info(`worker [${threadId}] working on ${users.length} users`)
        await processEligibility(
            this.blockSelectorAddress,
            this.chainId,
            this.saveProgress,
            users,
            this.etherBlocks
        )
        console.info(`worker [${threadId}]  is done`)
    }
}

;(async () => {
    const db = await getDb()
    const newWorker = new Worker(db)
    await newWorker.init()
    parentPort!.on("message", async (job: WorkerJob) => {
        const j = job as WorkerJob
        await newWorker.handleJob(j)
        const reply: WorkerJobReply = {
            success: true,
        }
        parentPort!.postMessage(reply)
    })
})()
