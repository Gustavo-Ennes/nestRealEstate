import { tenantWith } from '../tenant/utils';

const defaultLandlordInput = {
  name: 'landlord',
  cpf: '12312312322',
  email: 'landlord@landlord.com',
  phone: '1231231232',
};

const landlordWith = tenantWith;

export { defaultLandlordInput, landlordWith };
