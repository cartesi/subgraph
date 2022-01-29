import yargs from "yargs"

// graceful shutdown
process.on("SIGINT", function () {
    process.exit()
})

// parse command line
const argv = yargs
    .version()
    .commandDir("./src/commands", { extensions: ["js", "ts"] })
    .epilogue(
        "for more information, find the documentation at https://github.com/cartesi/subgraph"
    ).argv
