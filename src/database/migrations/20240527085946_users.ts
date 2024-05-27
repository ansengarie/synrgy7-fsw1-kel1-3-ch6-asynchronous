import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("users", (table) => {
    table.string("id", 255).primary();
    table.string("username").notNullable().unique();
    table.string("password").notNullable();
    table.enum("role", ["admin", "customer"]).defaultTo("customer");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("users");
}
