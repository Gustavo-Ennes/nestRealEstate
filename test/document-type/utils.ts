import { EDocumentType } from '../../src/domain/document/enum/document-type.enum';
import { CreateDocumentTypeInput } from '../../src/domain/document-type/dto/create-document-type.input';
import { ELegalType } from '../../src/domain/enum/legal-type.enum';

export const documentTypeInput: CreateDocumentTypeInput = {
  name: EDocumentType.LastBalanceSheet,
  legalType: ELegalType.Legal,
};
