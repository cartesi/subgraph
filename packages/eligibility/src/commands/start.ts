import { Argv } from "yargs"

import { processEligibility as processEligibilitySingleThreaded } from "../"
import { processEligibility } from "../multithread"

export interface Args {
    bsc: string
    chainid: number
    progress: number
    threads: number
}

export const command = ["start", "$0"]
export const describe = "begin the calculation procedure"

export const builder = (yargs: Argv) => {
    return yargs
        .option("bsc", {
            type: "string",
            describe: "Block Selector Contract's address",
            demandOption: true,
        })
        .option("chainid", {
            type: "number",
            describe: "The chain id to be processed",
            demandOption: true,
        })
        .option("progress", {
            type: "number",
            describe:
                "Max blocks processed accumulated before committing to DB",
            default: 20 * 1000,
            demandOption: true,
        })
        .option("threads", {
            type: "number",
            describe: "Number of parallel processes spawned",
            default: 1,
        })
}
export const handler = (options: Args) => {
    if (options.threads === 1) {
        return processEligibilitySingleThreaded(
            options.bsc,
            options.chainid,
            options.progress
        )
    } else {
        return processEligibility(
            options.bsc,
            options.chainid,
            options.progress,
            options.threads
        )
    }
}
