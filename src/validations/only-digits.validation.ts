import { ValidationArguments, registerDecorator } from 'class-validator';

const letterRegex = /[a-zA-Z]+/;
const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;/]/;

const validate = (value: string): boolean =>
  value ? !letterRegex.test(value) && !specialCharacterRegex.test(value) : true;
const defaultMessage = (args: ValidationArguments) =>
  `${args.property} should have only digits.`;

export const HasOnlyDigits = (object: object, propertyName: string) => {
  registerDecorator({
    name: `hasOnlyDigits`,
    target: object.constructor,
    propertyName: propertyName,
    validator: {
      validate,
      defaultMessage,
    },
  });
};
