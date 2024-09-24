import { registerDecorator, ValidationArguments } from 'class-validator';

const usernameRegex = /^[A-Za-z_]{5,}$/;

const validate = (value: string): boolean => usernameRegex.test(value);
const defaultMessage = (args: ValidationArguments) =>
  `${args.property} can have only words and underscores, 5 characters minimum.`;

export const IsValidUsername = (object: object, propertyName: string) => {
  registerDecorator({
    name: 'isValidUsername',
    target: object.constructor,
    propertyName: propertyName,
    validator: {
      validate,
      defaultMessage,
    },
  });
};
