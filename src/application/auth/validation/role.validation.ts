import { registerDecorator, ValidationArguments } from 'class-validator';
import { ERole } from '../role/role.enum';

const validate = (value: string): boolean =>
  Object.values(ERole).includes(value as ERole);
const defaultMessage = (args: ValidationArguments) =>
  `${args.value} is not a valid role.`;

export const IsValidRole = (object: object, propertyName: string) => {
  registerDecorator({
    name: 'isValidRole',
    target: object.constructor,
    propertyName: propertyName,
    validator: {
      validate,
      defaultMessage,
    },
  });
};
