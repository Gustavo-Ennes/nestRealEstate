import { inputWithError } from '../utils';

const defaultTenantInput = {
  name: 'tenant',
  cpf: '12312312322',
  email: 'tenant@tenant.com',
  phone: '1231231232',
};

const tenantWith = inputWithError(defaultTenantInput);

export { tenantWith };
