import { registerDecorator, ValidationArguments } from 'class-validator';

const siteRegex =
  /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?(\/[^\s]*)?$/;

const validate = (value: string): boolean =>
  value ? siteRegex.test(value) : true;

const defaultMessage = (args: ValidationArguments) =>
  `${args.property} is invalid.`;

export const IsSite = (object: object, propertyName: string) => {
  registerDecorator({
    name: 'isSite',
    target: object.constructor,
    propertyName: propertyName,
    validator: {
      validate,
      defaultMessage,
    },
  });
};
