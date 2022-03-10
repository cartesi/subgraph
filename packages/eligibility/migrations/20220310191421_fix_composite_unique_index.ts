import { config } from "dotenv"
config()
import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema
        .withSchema("ctsi")
        .alterTable("eligibility_process", (table) => {
            table.dropUnique(["id"])
            table.unique(["id", "subgraph_deployment"])
        })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema
        .withSchema("ctsi")
        .alterTable("eligibility_process", (table) => {
            table.dropUnique(["id", "subgraph_deployment"])
            table.unique(["id"])
        })
}
