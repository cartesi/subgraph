// Update with your config settings.
import { config } from "dotenv"
config()
const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } = process.env

module.exports = {
    client: "postgresql",
    connection: {
        host: DB_HOST,
        port: parseInt(DB_PORT!),
        user: DB_USER,
        password: DB_PASS,
        database: DB_NAME,
    },
    pool: {
        min: 2,
        max: 10,
    },
    migrations: {
        tableName: "knex_migrations",
    },
}
