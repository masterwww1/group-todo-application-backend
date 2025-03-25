exports.seed = async function (knex) {
    await knex('organizations').del();

    await knex('organizations').insert([
        {
            id: "932982034234",
            name: "Test Organization",
        }
    ])
}