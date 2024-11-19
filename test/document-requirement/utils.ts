import { CreateDocumentRequirementInput } from '../../src/domain/document-requirement/dto/create-document-requirement.input';
import { ERole } from '../../src/application/auth/role/role.enum';

export const documentRequirementInput: CreateDocumentRequirementInput = {
  role: ERole.Landlord,
  documentTypeId: 1,
};
