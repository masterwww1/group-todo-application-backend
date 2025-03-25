exports.seed = async function (knex) {
    await knex('projects').del();

    await knex('projects').insert([
        {
            id: "939939393334",
            organization_id: "932982034234",
            name: "Test Project",
            description: "This is a test project",
        }
    ])
}