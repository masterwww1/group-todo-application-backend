/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("users", (table) => {
    // Primary Key
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

    // Foreign Keys
    table
      .uuid("organization_id")
      .notNullable()
      .references("id")
      .inTable("organizations")
      .onDelete("CASCADE")
      .index();

    // Basic Info
    table.string("email").notNullable().unique().index();

    table.string("name").notNullable();

    table.string("password_hash").notNullable();

    // Account Status
    table.boolean("is_active").notNullable().defaultTo(true).index();

    table.boolean("email_verified").notNullable().defaultTo(false);

    // Role
    table
      .enum("role", ["admin", "member"])
      .notNullable()
      .defaultTo("member")
      .index();

    // Password Reset
    table.string("reset_password_token").unique().nullable();

    table.timestamp("reset_password_expires").nullable();

    // Session
    table.timestamp("last_login").nullable();

    // Timestamps
    table.timestamps(true, true);
    table.timestamp("deleted_at").nullable().index();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("users");
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.config = {
  transaction: true,
};
