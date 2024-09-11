import { LoginInput } from '../../src/auth/dto/login.input';
import { SignUpInput } from '../../src/auth/dto/signup.input';
import { Role } from '../../src/auth/role/role.enum';

export const defaultSignUpInput: SignUpInput = {
  username: 'tenant',
  role: Role.Admin,
  email: 'tenant@tenant.com',
  password: '1Senha!.',
};

export const defaultLoginInput: LoginInput = {
  password: '123',
  username: 'tenant',
};

export const signupWithout = {
  usernameCriteria: { ...defaultSignUpInput, username: 'Rui' },
  passwordCriteria: { ...defaultSignUpInput, password: '123' },
  validEmail: { ...defaultSignUpInput, email: '123@.dev.#' },
  validRole: { ...defaultSignUpInput, role: 'guitarist' },
};

export const loginWithout = {
  username: { ...defaultLoginInput, username: '' },
  password: { ...defaultLoginInput, password: '' },
};
