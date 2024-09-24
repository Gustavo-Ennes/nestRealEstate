import { registerDecorator, ValidationArguments } from 'class-validator';
import { ERole } from '../../auth/role/role.enum';
import { User } from '../entities/user.entity';

const validate = (role: any): boolean => Object.values(ERole).includes(role);

const defaultMessage = (args: ValidationArguments) =>
  `Inexistent role: ${JSON.stringify((args.object as User).role)}`;

export const IsValidRole = (object: object, propertyName: string) => {
  registerDecorator({
    name: 'isValidRoles',
    target: object.constructor,
    propertyName: propertyName,
    validator: {
      validate,
      defaultMessage,
    },
  });
};
