import { knex, Knex } from "knex"
import assert from "assert"
const {
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASS,
    DB_NAME,
    SUBGRAPH_NAME,
    NET_SUBGRAPH_NAME,
} = process.env
const subgraphName = SUBGRAPH_NAME || "cartesi/pos"
const networkSubgraphName = NET_SUBGRAPH_NAME || "cartesi/eth-blocks-mainnet"
const connOptions = {
    client: "pg",
    connection: {
        host: DB_HOST,
        port: parseInt(DB_PORT!),
        user: DB_USER,
        password: DB_PASS,
        database: DB_NAME,
        pool: { min: 0, max: 1 }, //@dev we are getting `sorry, too many clients already` at times
    },
}
const _db = knex(connOptions)

// search what will be the searchPath (sdgX)
let connectionInfo: Info | undefined

interface Info {
    deployment: Deployment
    knex: KnexDB
}

async function searchSubgraph(subgraphName: string) {
    return _db
        .select("sg.name")
        .select("ds.name")
        .select("ds.network")
        .select("ds.active")
        .select("ds.subgraph")
        .from("subgraphs.subgraph AS sg")
        .joinRaw(
            `join subgraphs.subgraph_version
                    AS sgv
                    ON (sgv.subgraph = sg.id AND sgv.id = sg.current_version)`
        )
        .join(
            "subgraphs.subgraph_deployment as sd",
            "sd.deployment",
            "sgv.deployment"
        )
        .join("deployment_schemas as ds", "ds.subgraph", "sd.deployment")
        .where("ds.active", true)
        .andWhere("sg.name", subgraphName)
}

async function getConnectionInfo() {
    const deployments = await searchSubgraph(subgraphName)
    if (deployments.length !== 1) {
        console.error(
            "Couldn't find exactly one deployment to process. Check the findings:",
            JSON.stringify(deployments, null, 2)
        )
        process.exit(1)
    }

    const networks = await searchSubgraph(networkSubgraphName)
    if (networks.length !== 1) {
        console.error(
            "Couldn't find exactly one network to the deployment. Check the findings:",
            JSON.stringify(networks, null, 2)
        )
        process.exit(1)
    }
    assert.equal(
        deployments[0].network,
        networks[0].network,
        `Deployment and EthereumBlocks subgraphs don't have matching networks ${deployments[0].network} vs ${networks[0].network}`
    )
    const options = {
        ...connOptions,
        searchPath: ["ctsi", deployments[0].name, networks[0].name],
    }
    options.connection.pool.max = 10
    await _db.destroy()
    connectionInfo = {
        knex: knex(options),
        deployment: {
            deploymentHash: deployments[0].subgraph as string,
            subgraphName: subgraphName,
        },
    }
    return connectionInfo
}

export interface KnexDB extends Knex<any, unknown[]> {}

export interface Deployment {
    deploymentHash: string
    subgraphName: string
}

export async function getDeployment(): Promise<Deployment> {
    if (!connectionInfo) (await getConnectionInfo()).deployment
    return connectionInfo!.deployment
}

export async function getDb(): Promise<KnexDB> {
    if (!connectionInfo) (await getConnectionInfo()).knex
    return connectionInfo!.knex
}
