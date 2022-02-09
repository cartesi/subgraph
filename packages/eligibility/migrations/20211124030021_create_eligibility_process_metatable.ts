import { config } from "dotenv"
config()
import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.raw("CREATE SCHEMA IF NOT EXISTS ctsi")
    await knex.schema
        .withSchema("ctsi")
        .createTable("eligibility_process", (table) => {
            table.text("id").notNullable().unique()
            table.text("subgraph_deployment").notNullable()
            table.text("subgraph_name").notNullable()
            table.text("last_blocknumber").notNullable()
            table.timestamp("updated_at").defaultTo(knex.fn.now())
        })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("eligibility_process")
}
