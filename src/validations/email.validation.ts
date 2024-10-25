import { registerDecorator, ValidationArguments } from 'class-validator';

const emailRegex = /^[A-Za-z0-9\.\-_]{5,}@[A-Za-z0-9]{2,}\.[a-z]{2,}$/;

const validate = (value: string): boolean => emailRegex.test(value);
const defaultMessage = (args: ValidationArguments) =>
  `${args.property} is invalid.`;

export const IsEmail = (object: object, propertyName: string) => {
  registerDecorator({
    name: 'isEmail',
    target: object.constructor,
    propertyName: propertyName,
    validator: {
      validate,
      defaultMessage,
    },
  });
};
