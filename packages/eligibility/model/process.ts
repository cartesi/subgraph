import { KnexDB } from "../db"

export class EligibilityProcess {
    blockSelectorId: string
    deploymentHash: string
    subgraphName: string
    lastBlock: number | undefined
    db: KnexDB

    constructor(
        blockSelectorId: string,
        deploymentHash: string,
        subgraphName: string,
        db: KnexDB
    ) {
        this.blockSelectorId = blockSelectorId
        this.deploymentHash = deploymentHash
        this.subgraphName = subgraphName
        this.db = db
    }

    async loadOrCreate() {
        const res = await this.db("eligibility_process")
            .select("*")
            .where("id", this.blockSelectorId)
            .andWhere("subgraph_deployment", this.deploymentHash)

        if (res && res[0]) {
            this.lastBlock = parseInt(res[0].last_blocknumber)
            return
        }
        this.lastBlock = 0
        await this.db("eligibility_process").insert({
            id: this.blockSelectorId,
            subgraph_deployment: this.deploymentHash,
            subgraph_name: this.subgraphName,
            last_blocknumber: this.lastBlock,
        })
        console.info(
            `New Process has been added to the db: ${this.blockSelectorId}`
        )
    }

    async save(blockNumber: number) {
        this.lastBlock = blockNumber
        await this.db("eligibility_process")
            .where("id", this.blockSelectorId)
            .andWhere("subgraph_deployment", this.deploymentHash)
            .update({
                last_blocknumber: this.lastBlock,
                // updated_at: Date.now(),
            })
        console.info(
            `Saved progress for the eligibility process. Last Block ${blockNumber}`
        )
    }
}
