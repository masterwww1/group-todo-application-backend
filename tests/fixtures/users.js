const bcrypt = require('bcrypt');
const { organizations } = require('./organizations');

const hashedPassword = bcrypt.hashSync('Password123!', 10);

const users = [
  {
    id: '33333333-3333-3333-3333-333333333333',
    organization_id: organizations[0].id, // Reference to first test organization
    email: 'admin@test.com',
    password_hash: hashedPassword,
    name: 'Admin User',
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    organization_id: organizations[0].id,
    email: 'user@test.com',
    password_hash: hashedPassword,
    name: 'Regular User',
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  }
];

const validUserData = {
  email: 'newuser@test.com',
  password: 'Password123!',
  name: 'New Test User',
  organization_id: organizations[0].id
};

const invalidUserData = {
  email: 'invalid-email',
  password: '123', // too short
  name: '',
  organization_id: 'invalid-uuid'
};

const loginCredentials = {
  email: users[0].email,
  password: 'Password123!'
};

module.exports = {
  users,
  validUserData,
  invalidUserData,
  loginCredentials,

  // Helper function to get specific user
  getUser: (index = 0) => ({
    ...users[index],
    password: 'Password123!' // Include plain password for testing
  }),

  // Helper function to create new user data
  createUserData: (override = {}) => ({
    ...validUserData,
    ...override,
    email: `user-${Date.now()}@test.com` // Ensure unique email
  }),

  // Helper function for authentication testing
  getLoginCredentials: (userIndex = 0) => ({
    email: users[userIndex].email,
    password: 'Password123!'
  })
};