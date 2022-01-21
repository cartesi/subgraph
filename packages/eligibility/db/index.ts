import { knex, Knex } from "knex"

const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME, SUBGRAPH_NAME } =
    process.env
const subgraphName = SUBGRAPH_NAME || "cartesi/pos"
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
let connectionPromise: Promise<Info> | undefined

interface Info {
    deployment: Deployment
    knex: KnexDB
}

async function getConnectionInfo() {
    connectionPromise = _db
        .select("sg.name")
        .select("ds.name")
        .select("ds.network")
        .select("ds.active")
        .select("ds.subgraph")
        .from("deployment_schemas AS ds")
        .join(
            "subgraphs.subgraph_version as sgv",
            "sgv.deployment",
            "=",
            "ds.subgraph"
        )
        .join("subgraphs.subgraph as sg", "sg.id", "=", "sgv.subgraph")
        .where("ds.active", true)
        .andWhere("sg.name", subgraphName)
        .then(async (deployments) => {
            if (deployments.length !== 1) {
                console.error(
                    "Couldn't find exactly one deployment to process. Check the findings:",
                    JSON.stringify(deployments, null, 2)
                )
                process.exit(1)
            }
            const networks = await _db
                .select("*")
                .from("public.chains")
                .where("name", deployments[0].network)
            if (networks.length !== 1) {
                console.error(
                    "Couldn't find exactly one network to the deployment. Check the findings:",
                    JSON.stringify(networks, null, 2)
                )
                process.exit(1)
            }

            const options = {
                ...connOptions,
                searchPath: [
                    "ctsi",
                    deployments[0].name,
                    networks[0].namespace,
                ],
            }
            options.connection.pool.max = 10
            await _db.destroy()
            return {
                knex: knex(options),
                deployment: {
                    deploymentHash: deployments[0].subgraph as string,
                    subgraphName: subgraphName,
                },
            }
        })
}

export interface KnexDB extends Knex<any, unknown[]> {}

export interface Deployment {
    deploymentHash: string
    subgraphName: string
}

export async function getDeployment(): Promise<Deployment> {
    if (!connectionPromise) getConnectionInfo()
    return (await connectionPromise!).deployment
}

export async function getDb(): Promise<KnexDB> {
    if (!connectionPromise) getConnectionInfo()
    return (await connectionPromise!).knex
}
