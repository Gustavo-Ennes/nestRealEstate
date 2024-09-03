import { registerDecorator, ValidationArguments } from 'class-validator';

const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/;

const validate = (value: string): boolean => passwordRegex.test(value);
const defaultMessage = (args: ValidationArguments) =>
  `${args.property} must have at least 1 number, 1 special character, 1 uppercase character and five total characters minimum.`;

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
