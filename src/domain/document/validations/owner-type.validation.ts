import { registerDecorator, ValidationArguments } from 'class-validator';

import { Document } from '../entities/document.entity';
import { EOwnerType } from '../enum/owner-type.enum';

const validate = (ownerType: any): boolean =>
  Object.values(EOwnerType).includes(ownerType);

const defaultMessage = (args: ValidationArguments) =>
  `Inexistent document owner type: ${(args.object as Document).ownerType}`;

export const isValidDocumentOwnerType = (
  object: object,
  propertyName: string,
) => {
  registerDecorator({
    name: 'isValidDocumentOwnerType',
    target: object.constructor,
    propertyName: propertyName,
    validator: {
      validate,
      defaultMessage,
    },
  });
};
