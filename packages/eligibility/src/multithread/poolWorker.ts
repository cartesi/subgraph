import { Worker } from "worker_threads"
import path = require("path")

import { WorkerJob, WorkerJobReply } from "./worker"

export class PoolWorker {
    worker: Worker
    resolveJob: ((value: unknown) => void) | null
    rejectJob: ((reason?: any) => void) | null

    constructor(
        blockSelectorAddress: string,
        chainId: number,
        latestBlock: number,
        users: string[],
        saveProgress: number
    ) {
        this.worker = new Worker(path.resolve(__dirname, "worker.js"), {
            workerData: {
                blockSelectorAddress,
                chainId,
                latestBlock,
                users,
                saveProgress,
            },
        })
        this.resolveJob = null
        this.rejectJob = null

        this.worker.on("message", this.onWorkerMessage.bind(this))
    }

    async run() {
        await this._run({ start: true })
    }

    async _run(job: WorkerJob) {
        await new Promise((resolve, reject) => {
            this.worker.postMessage(job)
            this.resolveJob = resolve
            this.rejectJob = reject
        })
    }
    onWorkerMessage(reply: WorkerJobReply) {
        const j = reply as WorkerJobReply
        if (j.success) return this.resolveJob!(j)
        this.rejectJob!(JSON.stringify(j))
    }
}
