import { LoginInput } from '../../src/application/auth/dto/login.input';
import { SignUpInput } from '../../src/application/auth/dto/signup.input';
import { ERole } from '../../src/application/auth/role/role.enum';

export const defaultSignUpInput: SignUpInput = {
  username: 'tenant',
  role: ERole.Admin,
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
