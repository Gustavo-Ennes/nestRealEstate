import { registerDecorator, ValidationArguments } from 'class-validator';

import { Document } from '../entities/document.entity';
import { EDocumentType } from '../enum/document-type.enum';

const validate = (documentType: any): boolean =>
  Object.values(EDocumentType).includes(documentType);

const defaultMessage = (args: ValidationArguments) =>
  `Inexistent document type: ${(args.object as Document).type}`;

export const isValidDocumentType = (object: object, propertyName: string) => {
  registerDecorator({
    name: 'isValidDocumentType',
    target: object.constructor,
    propertyName: propertyName,
    validator: {
      validate,
      defaultMessage,
    },
  });
};
