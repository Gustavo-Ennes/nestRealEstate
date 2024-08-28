import { registerDecorator, ValidationArguments } from 'class-validator';
import { Role } from 'src/auth/role/role.enum';
import { User } from '../entities/user.entity';

const validate = (role: any): boolean => Object.values(Role).includes(role);

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
