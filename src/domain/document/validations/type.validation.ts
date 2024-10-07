import { DocumentType } from '../../document-type/entities/document-type.entity';

/* 
  this was an async validator, but in e2e tests, I was unable to inject the DocumentTypeService
  in the async validator and test properly.
*/
export const validateDocumentType = async (
  value: any,
  types: DocumentType[] = [],
) => types.some((dt) => dt.name === value);
