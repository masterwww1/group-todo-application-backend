const bcrypt = require('bcrypt');

exports.seed = async function (knex) {
    await knex('users').del();

    const password_hash = await bcrypt.hash('password123', 10);

    await knex('users').insert([
        {
            id: "234234903423",
            organization_id: "932982034234",
            name: "John Doe",
            email: "johndoe@gmail.com",
            password_hash
        }
    ])
}