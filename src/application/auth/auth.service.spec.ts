import { TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/sequelize';
import { User } from '../user/entities/user.entity';
import { ERole } from './role/role.enum';
import { SignUpInput } from './dto/signup.input';
import { hashPassword, verifyAndDecodeToken } from './auth.utils';
import { validate } from 'class-validator';
import { LoginInput } from './dto/login.input';
import { createAuthTestModule } from './testConfig/auth.test.config';
import { Client } from '../client/entities/client.entity';

describe('AuthService', () => {
  let service: AuthService,
    jwtService: JwtService,
    userModel: typeof User,
    clientModel: typeof Client;
  const signUpInput: SignUpInput = {
    email: 'gustavo@ennes.dev',
    password: '1Senha!.',
    role: ERole.Admin,
    username: 'admin',
    clientId: 1,
  };

  beforeAll(async () => {
    const module: TestingModule = await createAuthTestModule();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userModel = module.get<typeof User>(getModelToken(User));
    clientModel = module.get<typeof Client>(getModelToken(Client));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should sign up', async () => {
    const createdUser = {
      ...signUpInput,
      id: 1,
    } as User;
    const client = { id: 1 };
    (userModel.findOne as jest.Mock).mockResolvedValueOnce(null);
    (userModel.create as jest.Mock).mockResolvedValueOnce(createdUser);
    (clientModel.findByPk as jest.Mock).mockResolvedValueOnce(client);

    const res = await service.signUp(signUpInput);
    const decodedToken = await verifyAndDecodeToken(
      res.access_token,
      jwtService,
    );

    expect(res).toHaveProperty('access_token');
    expect(res.access_token).not.toBeNull();
    expect(decodedToken).toHaveProperty('sub', createdUser.id);
    expect(decodedToken).toHaveProperty('username', createdUser.username);
    expect(decodedToken).toHaveProperty('email', createdUser.email);
    expect(decodedToken).toHaveProperty('role', createdUser.role);
    expect(decodedToken).toHaveProperty('client', client);
    expect(decodedToken).toHaveProperty('iat');
  });

  it('should not sign up if username already exists', async () => {
    const sameUsernameUser = {
      ...signUpInput,
      id: 1,
    } as User;
    (userModel.findOne as jest.Mock).mockResolvedValueOnce(sameUsernameUser);

    try {
      await service.signUp(signUpInput);
    } catch (error) {
      expect(error).toHaveProperty(
        'message',
        `Username ${sameUsernameUser.username} already taken.`,
      );
    }
  });

  it('should not sign up if client does not exists', async () => {
    (clientModel.findByPk as jest.Mock).mockResolvedValueOnce(undefined);
    try {
      await service.signUp(signUpInput);
    } catch (error) {
      expect(error).toHaveProperty(
        'message',
        `Client not found with provided id.`,
      );
    }
  });

  it('should not sign up if username do not match criteria', async () => {
    const dtoObj = { ...signUpInput, id: 1, username: 'asd' };
    const dtoInstance = Object.assign(new SignUpInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('username');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isValidUsername',
      'username can have only words and underscores, 5 characters minimum.',
    );
  });

  it('should not sign up if password do not match criteria', async () => {
    const dtoObj = { ...signUpInput, id: 1, password: 'asd' };
    const dtoInstance = Object.assign(new SignUpInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('password');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isValidPassword',
      'password must have at least 1 number, 1 special character, 1 uppercase character and five total characters minimum.',
    );
  });

  it('should not sign up if role is invalid', async () => {
    const dtoObj = { ...signUpInput, id: 1, role: 'guitarist' };
    const dtoInstance = Object.assign(new SignUpInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('role');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isValidRole',
      `${dtoInstance.role} is not a valid role.`,
    );
  });

  it('should not sign up if email is invalid', async () => {
    const dtoObj = { ...signUpInput, id: 1, email: 'guitarist@.guitar.rock!' };
    const dtoInstance = Object.assign(new SignUpInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('email');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isEmail',
      `email is invalid.`,
    );
  });

  it('should login', async () => {
    const client = { id: 1 };
    const user = {
      ...signUpInput,
      id: 1,
      password: await hashPassword(signUpInput.password),
      client: { id: 1 },
    } as User;
    (userModel.findOne as jest.Mock).mockResolvedValueOnce(user);
    (clientModel.findByPk as jest.Mock).mockResolvedValueOnce(client);

    const res = await service.login({
      username: user.username,
      password: signUpInput.password,
    });
    const decodedToken = await verifyAndDecodeToken(
      res.access_token,
      jwtService,
    );

    expect(res).toHaveProperty('access_token');
    expect(res.access_token).not.toBeNull();
    expect(decodedToken).toHaveProperty('sub', user.id);
    expect(decodedToken).toHaveProperty('username', user.username);
    expect(decodedToken).toHaveProperty('email', user.email);
    expect(decodedToken).toHaveProperty('role', user.role);
    expect(decodedToken).toHaveProperty('client', client);
    expect(decodedToken).toHaveProperty('iat');
  });

  it('should not login if username is empty', async () => {
    const dtoObj = { password: signUpInput.password, username: '' };
    const dtoInstance = Object.assign(new LoginInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('username');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isNotEmpty',
      `username should not be empty`,
    );
  });

  it('should not login if password is empty', async () => {
    const dtoObj = { password: '', username: 'gustavo' };
    const dtoInstance = Object.assign(new LoginInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('password');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isNotEmpty',
      `password should not be empty`,
    );
  });
  it('should not login if email is not registered with a user', async () => {
    (userModel.findOne as jest.Mock).mockResolvedValue(null);

    try {
      await service.login({
        username: 'any',
        password: signUpInput.password,
      });
    } catch (error) {
      expect(error).toHaveProperty(
        'message',
        'No user found with username any',
      );
    }
  });
  it('should not login if password do not match', async () => {
    const user = {
      ...signUpInput,
      id: 1,
      password: await hashPassword(signUpInput.password),
    } as User;
    (userModel.findOne as jest.Mock).mockResolvedValue(user);
    try {
      await service.login({
        username: user.username,
        password: 'wrongPassword',
      });
    } catch (error) {
      expect(error).toHaveProperty(
        'message',
        "Password didn't match for user admin",
      );
    }
  });
});
