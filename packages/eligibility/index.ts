import yargs, { Argv } from "yargs"

import { processEligibility as processEligibilitySingleThreaded } from "./src"
import { processEligibility } from "./src/multithread"

export interface EligibilityOptions {
    bsc: string
    chainid: number
    progress: number
    threads: number
}

yargs(process.argv.slice(2))
    .scriptName("eligibility-process")
    .usage("$0 <cmd> [args]")
    .command(
        "start",
        "begin the calculation procedure",
        (yargs: Argv) => {
            yargs.positional("bsc", {
                type: "string",
                describe: "Block Selector Contract's address",
                demandOption: true,
            })
            yargs.positional("chainid", {
                type: "number",
                describe: "The chain id to be processed",
                demandOption: true,
            })
            yargs.positional("progress", {
                type: "number",
                describe:
                    "Max blocks processed accumulated before committing to DB",
                default: 20 * 1000,
                demandOption: true,
            })
            yargs.positional("threads", {
                type: "number",
                describe: "Number of parallel processes spawned",
                default: 1,
            })
        },
        (argv): Promise<void> => {
            const options = argv as unknown as EligibilityOptions //@dev how to avoid this workaround?
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
    )
    .help().argv
