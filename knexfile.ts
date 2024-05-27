import type { Knex } from "knex";

// Update with your config settings.

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "postgres",
    connection: {
      database: "db_tagihan",
      user: "postgres",
      password: "123456",
      host: "127.0.0.1",
      port: 5432,
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "./src/database/migrations",
    },
    seeds: {
      directory: "src/database/seeds",
    },
  },
};

module.exports = config;
