import { registerDecorator, ValidationArguments } from 'class-validator';
import { ERole } from '../../application/auth/role/role.enum';

const validate = (ownerRole: any): boolean =>
  Object.values(ERole).includes(ownerRole);

const defaultMessage = (args: ValidationArguments) =>
  `Inexistent document owner role: ${args.value}`;

export const isValidDocumentOwnerRole = (
  object: object,
  propertyName: string,
) => {
  registerDecorator({
    name: 'isValidDocumentOwnerRole',
    target: object.constructor,
    propertyName: propertyName,
    validator: {
      validate,
      defaultMessage,
    },
  });
};
