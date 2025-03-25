const bcrypt = require('bcrypt');
const authService = require('../../../src/services/auth.service');
const { users, validUserData, createUserData } = require('../../fixtures/users');
const { organizations } = require('../../fixtures/organizations');
const { UnauthorizedError, UserNotFoundError, RegistrationError, InvalidCredentialsError } = require('../../../src/utils/errors');

describe('Auth Service', () => {
  let db;

  beforeAll(async () => {
    db = global.db;
    // Create test organization
    await db('organizations').insert(organizations[0]);
  });

  
  beforeEach(async () => {
    jest.clearAllMocks();
    // Clean up users table before each test
    await db('users').del();
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await db('organizations').del();
    await db('users').del();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const userData = createUserData();
      const user = await authService.register(userData);

      // Verify user creation
      expect(user).toMatchObject({
        id: expect.any(String),
        email: userData.email,
        name: userData.name
      });
      expect(user).not.toHaveProperty('password_hash');

      // Verify database record
      const savedUser = await db('users')
        .where('email', userData.email)
        .first();
      expect(savedUser).toBeTruthy();
    });

    it('should throw error for duplicate email', async () => {
      const userData = createUserData();
      await authService.register(userData);

      await expect(authService.register(userData)).rejects.toThrow(RegistrationError);
    });

    it('should hash password before saving', async () => {
      const userData = createUserData();
      const user = await authService.register(userData);

      const savedUser = await db('users')
        .where('id', user.id)
        .first();

      expect(savedUser.password_hash).not.toBe(userData.password);
      expect(await bcrypt.compare(
        userData.password,
        savedUser.password_hash
      )).toBe(true);
    });
  });

  describe('login', () => {
    let registeredUser;

    beforeEach(async () => {
      const userData = createUserData();
      registeredUser = await authService.register(userData);
    });

    it('should login with valid credentials', async () => {
      const result = await authService.login(
        registeredUser.email,
        'Password123!' // from createUserData default
      );

      expect(result).toMatchObject({
        token: expect.any(String),
        user: {
          id: registeredUser.id,
          email: registeredUser.email,
          name: registeredUser.name
        }
      });
      expect(result.user).not.toHaveProperty('password_hash');
    });

    it('should throw error for invalid password', async () => {
      await expect(
        authService.login(registeredUser.email, 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for non-existent email', async () => {
      await expect(
        authService.login('nonexistent@test.com', 'Password123!')
      ).rejects.toThrow(InvalidCredentialsError);
    });
  });

  describe('getCurrentUser', () => {
    let registeredUser;
    let authToken;

    beforeEach(async () => {
      const userData = createUserData();
      registeredUser = await authService.register(userData);
      const loginResult = await authService.login(
        userData.email,
        'Password123!'
      );
      authToken = loginResult.token;
    });

    it('should return current user profile', async () => {
      const user = await authService.getCurrentUser(authToken);

      console.log(user);

      expect(user).toMatchObject({
        id: registeredUser.id,
        email: registeredUser.email,
        name: registeredUser.name
      });
      expect(user).not.toHaveProperty('password_hash');
    });

    it('should throw error for invalid token', async () => {
      await expect(
        authService.getCurrentUser('invalid-token')
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UserNotFoundError when no user exists for the token', async () => {
      await db('users').truncate();
      await expect(authService.getCurrentUser(authToken)).rejects.toThrow(UserNotFoundError);
      await expect(authService.getCurrentUser(authToken)).rejects.toThrow('User not found');
    });
  });
});