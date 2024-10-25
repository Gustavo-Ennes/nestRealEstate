import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

const message = (args: ValidationArguments) =>
  `${args.property} or ${args.constraints[0]} must contain a valid value`;

const cpfCnpjValidator = (
  value: any,
  otherField: string,
  args: ValidationArguments,
) => {
  const relatedValue = (args.object as any)[otherField];

  return relatedValue &&
    typeof relatedValue === 'string' &&
    relatedValue.trim().length > 0
    ? true
    : typeof value === 'string' && value.trim().length > 0;
};

export const ContainsCpfOrCnpj =
  (otherField: string, validationOptions?: ValidationOptions) =>
  (object: object, propertyName: string) => {
    registerDecorator({
      name: 'containsCpfOrCnpj',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate: (value: any, args: ValidationArguments) =>
          cpfCnpjValidator(value, otherField, args),
        defaultMessage: (args: ValidationArguments) => message(args),
      },
      constraints: [otherField],
    });
  };
