import { registerDecorator, ValidationArguments } from 'class-validator';

const lengthRegex = /[a-zA-Z]{5,}/;
const numberRegex = /[0-9]+/;
const specialCharRegex = /[!@#$%^&*\.]+/;

const validate = (value: string): boolean =>
  lengthRegex.test(value) &&
  numberRegex.test(value) &&
  specialCharRegex.test(value);

const defaultMessage = (args: ValidationArguments) =>
  `${args.property} needs at least 1 number and 1 special charater, 5 characters minimum.`;

export const IsValidPassword = (object: object, propertyName: string) => {
  registerDecorator({
    name: 'isValidPassword',
    target: object.constructor,
    propertyName: propertyName,
    validator: {
      validate,
      defaultMessage,
    },
  });
};
