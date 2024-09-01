import { sign } from 'jsonwebtoken';
import * as request from 'supertest';

const generateToken = (user = { sub: 1, role: 'admin' }) => {
  return sign(
    {
      sub: user.sub,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' },
  );
};

const requestAndCheckError =
  (path: string) =>
  async ({ app, token, query, variables, property, constraints }) => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query,
        variables,
      })
      .expect(200);

    expect(res.body.errors).toBeInstanceOf(Array);
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('path', [path]);
    expect(res.body.errors[0].extensions).toHaveProperty('code', 'BAD_REQUEST');
    expect(
      res.body.errors[0].extensions.originalError.message[0],
    ).toHaveProperty('property', property);
    expect(
      res.body.errors[0].extensions.originalError.message[0],
    ).toHaveProperty('constraints', constraints);
  };

const defaultTenantInput = {
  name: 'tenant',
  cpf: '12312312322',
  email: 'tenant@tenant.com',
  phone: '1231231232',
};

const tenantWith = {
  empty: {
    name: { ...defaultTenantInput, name: '' },
    phone: { ...defaultTenantInput, phone: '' },
    email: { ...defaultTenantInput, email: '' },
    cpjAndCnpj: { ...defaultTenantInput, cpf: undefined },
  },
  wrong: {
    cpfLength: { ...defaultTenantInput, cpf: '123' },
    cnpjLength: { ...defaultTenantInput, cnpj: '123', cpf: undefined },
    phoneLength: { ...defaultTenantInput, phone: '123' },
  },
  lettersAndSpecialChars: {
    inCpf: { ...defaultTenantInput, cpf: '123asd123!!' },
    inCnpj: { ...defaultTenantInput, cnpj: '123asd123asd@@' },
    inPhone: { ...defaultTenantInput, phone: '123asd123@@' },
  },
  numbersAndSpecialChars: {
    inName: { ...defaultTenantInput, name: 'gus7@v0' },
  },
  invalid: {
    emailPattern: { ...defaultTenantInput, email: 'a23@.com.#' },
  },
};

export { generateToken, requestAndCheckError, tenantWith };
