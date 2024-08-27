import { registerDecorator, ValidationArguments } from 'class-validator';

enum LengthValidationTypes {
  Cpf = 'cpf',
  Cnpj = 'cnpj',
  Phone = 'phone',
}
const lengthOf = {
  cpf: '11',
  cnpj: '14',
  phone: '10 or 11',
};

const lengthValidator = (type: string, value: string) => {
  if (value)
    switch (type) {
      case LengthValidationTypes.Cpf:
        return value.length === 11;
      case LengthValidationTypes.Cnpj:
        return value.length === 14;
      case LengthValidationTypes.Phone:
        return value.length === 10 || value.length === 11;
      default:
        return null;
    }
  return true;
};

const message = (property: string) =>
  `${property} should have ${lengthOf[property]} digits`;

const LengthValidatorBase =
  (type: LengthValidationTypes) => (object: object, propertyName: string) => {
    registerDecorator({
      name: 'containsCpfOrCnpj',
      target: object.constructor,
      propertyName: propertyName,
      validator: {
        validate: (value: any) => lengthValidator(type, value),
        defaultMessage: (args: ValidationArguments) => message(args.property),
      },
    });
  };

export const IsCpfLength = LengthValidatorBase(LengthValidationTypes.Cpf);
export const IsCnpjLength = LengthValidatorBase(LengthValidationTypes.Cnpj);
export const IsPhoneLength = LengthValidatorBase(LengthValidationTypes.Phone);
