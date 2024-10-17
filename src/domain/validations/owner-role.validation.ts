import { registerDecorator, ValidationArguments } from 'class-validator';

import { Document } from '../document/entities/document.entity';
import { ERole } from '../../application/auth/role/role.enum';

const validate = (ownerRole: any): boolean =>
  Object.values(ERole).includes(ownerRole);

const defaultMessage = (args: ValidationArguments) =>
  `Inexistent document owner role: ${(args.object as Document).ownerRole}`;

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
