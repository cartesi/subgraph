import fs from "fs";
import path from "path";
import {
    BuidlerRuntimeEnvironment,
    DeploymentsExtension,
} from "@nomiclabs/buidler/types";
import { task, types } from "@nomiclabs/buidler/config";
import { SubgraphManifest } from "../src/thegraph";
import yaml from "js-yaml";

/**
 * Default options
 */
const DEFAULT_OPTIONS: SubgraphOptions = {
    inputFile: "./subgraph.template.yaml",
    outputFile: "./subgraph.yaml",
    abiDir: "./abi",
};

/**
 * Resolves the address of a contract by name from a deployment
 * @param deployments deployment artifacts
 * @param contractName name of contract
 */
const resolveAddress = async (
    deployments: DeploymentsExtension,
    contractName: string
): Promise<string> => {
    if (contractName.startsWith("0x")) {
        return contractName;
    } else {
        const deployment = await deployments.get(contractName);
        console.log(`${contractName} resolved to ${deployment.address}`);
        return deployment.address;
    }
};

/**
 * Returns the block on which the contract was deployed
 * @param deployments deployment artifacts
 * @param contractName name of contract
 */
const startBlock = async (
    deployments: DeploymentsExtension,
    contractName: string
): Promise<number | undefined> => {
    const deployment = await deployments.get(contractName);
    return deployment.receipt?.blockNumber;
};

/**
 *
 * @param deployments deployment artifacts
 * @param abiDir output directory for ABI
 * @param contractName name of contract
 */
const extractAbi = async (
    deployments: DeploymentsExtension,
    abiDir: string,
    contractName: string
): Promise<string> => {
    const artifact = await deployments.getArtifact(contractName);
    const filename = path.join(abiDir, `${contractName}.json`);
    console.log(`Extracting ABI of ${contractName} and writing to ${filename}`);
    const abiStr = JSON.stringify(artifact.abi, null, 1);
    fs.writeFileSync(filename, abiStr);
    return filename;
};

export interface SubgraphOptions {
    inputFile?: string;
    outputFile?: string;
    abiDir?: string;
}

const subgraph = async (
    bre: BuidlerRuntimeEnvironment,
    options?: SubgraphOptions
) => {
    const { deployments } = bre;
    const inputFile =
        options?.inputFile || (DEFAULT_OPTIONS.inputFile as string);
    const outputFile =
        options?.outputFile || (DEFAULT_OPTIONS.outputFile as string);
    const abiDir = options?.abiDir || (DEFAULT_OPTIONS.abiDir as string);

    // load input yaml template file
    console.log(`Loading ${inputFile}`);
    const template = yaml.load(
        fs.readFileSync(inputFile, "utf-8")
    ) as SubgraphManifest;

    if (template.dataSources) {
        for (const dataSource of template.dataSources) {
            // set network using buidler network name
            dataSource.network = bre.network.name;

            if (dataSource.kind == "ethereum/contract") {
                // assume the `address` is the contract name
                const contractName = dataSource.source.address;

                // and resolve the address using the buidler deployment
                dataSource.source.address = await resolveAddress(
                    deployments,
                    contractName
                );

                // set start block as the contract deployment block
                dataSource.source.startBlock = await startBlock(
                    deployments,
                    contractName
                );
            }

            if (dataSource.mapping.abis) {
                for (const abi of dataSource.mapping.abis) {
                    // extract ABI to dedicated file assuming name is the name of contract
                    abi.file = await extractAbi(deployments, abiDir, abi.name);
                }
            }
        }
    }
    console.log(`Writing config to ${outputFile}`);
    fs.writeFileSync(outputFile, yaml.dump(template));
};

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
    .setAction(async (taskArgs, bre) => {
        await subgraph(bre, taskArgs);
    });
