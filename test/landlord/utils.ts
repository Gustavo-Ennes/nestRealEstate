import { CreateLandlordInput } from '../../src/domain/landlord/dto/create-landlord.input';
import { inputWithError } from '../utils';

const landlordInput: CreateLandlordInput = {
  name: 'landlord',
  cpf: '12312312322',
  email: 'landlord@landlord.com',
  phone: '12312312322',
  clientId: 1,
  addressId: 1,
  cnpj: null,
};

const landlordWith = inputWithError(landlordInput);

export { landlordInput, landlordWith };
