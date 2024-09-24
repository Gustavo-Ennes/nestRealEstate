import { ValidationArguments, registerDecorator } from 'class-validator';

const numberRegex = /[0-9]+/;
const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;/]/;

const validate = (value: string): boolean =>
  value ? !numberRegex.test(value) && !specialCharacterRegex.test(value) : true;
const defaultMessage = (args: ValidationArguments) =>
  `${args.property} should have only letters.`;

export const HasOnlyLetters = (object: object, propertyName: string) => {
  registerDecorator({
    name: `hasOnlyLetters`,
    target: object.constructor,
    propertyName: propertyName,
    validator: {
      validate,
      defaultMessage,
    },
  });
};
