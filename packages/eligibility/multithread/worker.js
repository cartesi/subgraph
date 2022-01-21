// this file is a workaround the worker API that currently
// is incapable of loading .ts files
const path = require("path")

require("ts-node").register()
require(path.resolve(__dirname, "./worker.ts"))
