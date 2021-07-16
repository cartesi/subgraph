// Copyright 2021 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import fs from "fs"
import path from "path"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { Deployment } from "hardhat-deploy/types"
import { task, types } from "hardhat/config"
import { SubgraphManifest } from "./thegraph"
import {
    Resolver,
    DeploymentResolver,
    DeploymentsResolver,
    ExportResolver,
} from "./resolver"
import yaml from "js-yaml"

/**
 * Default options
 */
const DEFAULT_OPTIONS: SubgraphOptions = {
    inputFile: "./subgraph.template.yaml",
    outputFile: "./subgraph.yaml",
    abiDir: "./abi",
}

export interface SubgraphOptions {
    inputFile?: string
    outputFile?: string
    abiDir?: string
    exportFile?: string
}

const subgraph = async (
    hre: HardhatRuntimeEnvironment,
    options: SubgraphOptions
) => {
    const { deployments } = hre
    const inputFile =
        options?.inputFile || (DEFAULT_OPTIONS.inputFile as string)
    const outputFile =
        options?.outputFile || (DEFAULT_OPTIONS.outputFile as string)
    const abiDir = options?.abiDir || (DEFAULT_OPTIONS.abiDir as string)
    const primaryResolver = options.exportFile
        ? new ExportResolver(
              JSON.parse(fs.readFileSync(options.exportFile).toString())
          )
        : new DeploymentsResolver(deployments)

    // load input yaml template file
    console.log(`Loading ${inputFile}`)
    const template = yaml.load(
        fs.readFileSync(inputFile, "utf-8")
    ) as SubgraphManifest

    if (template.dataSources) {
        for (const dataSource of template.dataSources) {
            // set network using buidler network name
            dataSource.network = hre.network.name

            if (dataSource.kind == "ethereum/contract") {
                // assume the `address` is the contract name
                let contractName = dataSource.source.address
                let resolver: Resolver = primaryResolver

                if (contractName.indexOf(":") >= 0) {
                    const components = contractName.split(":")
                    const exportFile = components[0]
                    contractName = components[1]
                    resolver = new ExportResolver(
                        JSON.parse(fs.readFileSync(exportFile).toString())
                    )
                } else if (contractName.endsWith(".json")) {
                    const deployment: Deployment = JSON.parse(
                        fs.readFileSync(contractName).toString()
                    )
                    resolver = new DeploymentResolver(deployment)
                }

                // and resolve the address using the buidler deployment
                dataSource.source.address = await resolver.getAddress(
                    contractName
                )

                // set start block as the contract deployment block
                dataSource.source.startBlock = await resolver.getStartBlock(
                    contractName
                )

                if (dataSource.mapping.abis) {
                    for (const abi of dataSource.mapping.abis) {
                        // extract ABI to dedicated file assuming name is the name of contract
                        const contractName = abi.name
                        const abiDefinition = await resolver.getAbi(
                            contractName
                        )
                        const dir = abi.file || abiDir
                        const filename = path.join(dir, `${contractName}.json`)
                        console.log(
                            `Extracting ABI of ${contractName} and writing to ${filename}`
                        )
                        const abiStr = JSON.stringify(abiDefinition, null, 1)
                        fs.mkdirSync(dir, { recursive: true }) // make sure output directoy exist
                        fs.writeFileSync(filename, abiStr)
                        abi.file = filename
                    }
                }
            }
        }
    }

    if (template.templates) {
        for (const dataSource of template.templates) {
            // set network using buidler network name
            dataSource.network = hre.network.name

            if (dataSource.kind == "ethereum/contract") {
                if (dataSource.mapping.abis) {
                    for (const abi of dataSource.mapping.abis) {
                        // extract ABI to dedicated file assuming name is the name of contract
                        const contractName = abi.name
                        const abiDefinition = await primaryResolver.getAbi(
                            contractName
                        )
                        const dir = abi.file || abiDir
                        const filename = path.join(dir, `${contractName}.json`)
                        console.log(
                            `Extracting ABI of ${contractName} and writing to ${filename}`
                        )
                        const abiStr = JSON.stringify(abiDefinition, null, 1)
                        fs.mkdirSync(dir, { recursive: true }) // make sure output directoy exist
                        fs.writeFileSync(filename, abiStr)
                        abi.file = filename
                    }
                }
            }
        }
    }

    console.log(`Writing config to ${outputFile}`)
    fs.writeFileSync(outputFile, yaml.dump(template))
}

export interface ExportAbiOptions {
    contractName: string
    exportFile?: string
    abiDir?: string
}

const exportAbi = async (
    hre: HardhatRuntimeEnvironment,
    options: ExportAbiOptions
) => {
    const { deployments } = hre
    const contractName = options.contractName
    const abiDir = options?.abiDir || (DEFAULT_OPTIONS.abiDir as string)

    const resolver = options.exportFile
        ? new ExportResolver(
              JSON.parse(fs.readFileSync(options.exportFile).toString())
          )
        : new DeploymentsResolver(deployments)

    const abiDefinition = await resolver.getAbi(contractName)
    const filename = path.join(abiDir, `${contractName}.json`)
    console.log(`Extracting ABI of ${contractName} and writing to ${filename}`)
    const abiStr = JSON.stringify(abiDefinition, null, 1)

    fs.mkdirSync(abiDir, { recursive: true }) // make sure output directoy exist
    fs.writeFileSync(filename, abiStr)
}

// Task to generate thegraph subgraph definition
task("subgraph", "Generate thegraph config from a template")
    .addOptionalParam(
        "inputFile",
        "Template file path",
        DEFAULT_OPTIONS.inputFile,
        types.string
    )
    .addOptionalParam(
        "outputFile",
        "Output file to write to",
        DEFAULT_OPTIONS.outputFile,
        types.string
    )
    .addOptionalParam(
        "abiDir",
        "Directory to export required ABIs",
        DEFAULT_OPTIONS.abiDir,
        types.string
    )
    .addOptionalParam(
        "exportFile",
        "Deployment export file to read address and ABI from",
        undefined,
        types.string
    )
    .setAction(async (taskArgs, hre) => {
        await subgraph(hre, taskArgs)
    })

task("export-abi", "Export ABI of contract")
    .addOptionalParam(
        "abiDir",
        "Directory to export required ABIs",
        DEFAULT_OPTIONS.abiDir,
        types.string
    )
    .addOptionalParam(
        "exportFile",
        "Deployment export file to read address and ABI from",
        undefined,
        types.string
    )
    .addPositionalParam("contractName", "Name of contract")
    .setAction(async (taskArgs, hre) => {
        await exportAbi(hre, taskArgs)
    })
