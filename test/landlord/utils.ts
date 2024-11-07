import { inputWithError } from '../utils';

const defaultLandlordInput = {
  name: 'landlord',
  cpf: '12312312322',
  email: 'landlord@landlord.com',
  phone: '1231231232',
  clientId: 1,
};

const landlordWith = inputWithError(defaultLandlordInput);

export { defaultLandlordInput, landlordWith };
