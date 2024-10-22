export const updateMutation = `
  mutation UpdateDocumentRequirement($input: UpdateDocumentRequirementInput!) {
    updateDocumentRequirement(updateDocumentRequirementInput: $input) {
      id
      documentTypeId
      role
      isRequired
      documentType {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
`;

export const findAllQuery = `
  query DocumentRequirements {
    documentRequirements {
      id
      documentTypeId
      role
      isRequired
      documentType {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
`;

export const findOneQuery = `
  query DocumentRequirement($id: Int!) {
    documentRequirement(id: $id) {
      id
      documentTypeId
      role
      isRequired
      documentType {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
`;

export const deleteMutation = `
  mutation RemoveDocumentRequirement($id: Int!) {
    removeDocumentRequirement(id: $id)
  }
`;

export const createMutation = `
  mutation CreateDocumentRequirement($input: CreateDocumentRequirementInput!) {
    createDocumentRequirement(createDocumentRequirementInput: $input) {
      id
      documentTypeId
      role
      isRequired
      documentType {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
`;
