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

export { tenantWith };
