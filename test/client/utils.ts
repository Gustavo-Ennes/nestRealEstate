import { CreateClientInput } from '../../src/application/client/dto/create-client.input';

export const clientInput: CreateClientInput = {
  cnpj: '12312312312322',
  email: 'client@client.com',
  name: 'Franz Kafka',
  phone: '12312312322',
  site: 'client.com',
  isActive: true,
  addressId: 1,
};
