import { registerDecorator, ValidationArguments } from 'class-validator';
import { ERole } from '../application/auth/role/role.enum';

// excluding 'admin' and 'superadmin' roles here because they
// aren't document owners, just tenants, landlords, guarantors are
const adminRolesToExlude = [ERole.Admin, ERole.Superadmin];
const rolesExcludingAdmins = Object.values(ERole).filter(
  (value) => !adminRolesToExlude.includes(value),
);

const validate = (ownerRole: any): boolean =>
  rolesExcludingAdmins.includes(ownerRole);

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
