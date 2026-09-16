/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
async function up(knex) {
    await knex.schema.createTable("blocked_users", (table) => {
        table.increments("id").primary();

        table
            .integer("blockerId")
            .notNullable()
            .references("id")
            .inTable("users")
            .onDelete("CASCADE");

        table
            .integer("blockedId")
            .notNullable()
            .references("id")
            .inTable("users")
            .onDelete("CASCADE");

        table
            .timestamp("created_at")
            .defaultTo(knex.fn.now());

        table.unique(["blockerId", "blockedId"]);
    });
};

async function down(knex) {
    await knex.schema.dropTableIfExists(
        "blocked_users"
    );
};


module.exports = { up, down };
