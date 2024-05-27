import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("invoice", (table: Knex.TableBuilder) => {
    table.increments("id").primary();
    table.integer("type_invoice_id").unsigned().notNullable();
    table
      .foreign("type_invoice_id")
      .references("type_invoice.id")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
    table.string("user_id").unsigned().notNullable();
    table
      .foreign("user_id")
      .references("users.id")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
    table.enum("status", ["paid", "unpaid"]).defaultTo("unpaid");
    table.integer("quantity").notNullable();
    table.integer("total_amount").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("invoice");
}
