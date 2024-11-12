import { CreateTenantInput } from '../../src/domain/tenant/dto/create-tenant.input';
import { inputWithError } from '../utils';

const tenantInput: CreateTenantInput = {
  name: 'tenant',
  cpf: '12312312322',
  email: 'tenant@tenant.com',
  phone: '12312312322',
  cnpj: '12312312312322',
  clientId: 1,
  addressId: 1,
};

const tenantWith = inputWithError(tenantInput);

export { tenantWith, tenantInput };
