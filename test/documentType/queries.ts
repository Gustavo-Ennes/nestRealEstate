export const updateMutation = `
  mutation UpdateDocumentType($input: UpdateDocumentTypeInput!) {
    updateDocumentType(updateDocumentTypeInput: $input) {
      id
      name
      legalType
      createdAt
      updatedAt
    }
  }
`;

export const findAllQuery = `
  query DocumentTypes {
    documentTypes {
      id
      name
      legalType
      createdAt
      updatedAt
    }
  }
`;

export const findOneQuery = `
  query DocumentType($id: Int!) {
    documentType(id: $id) {
      id
      name
      legalType
      createdAt
      updatedAt
    }
  }
`;

export const deleteMutation = `
  mutation RemoveDocumentType($id: Int!) {
    removeDocumentType(id: $id)
  }
`;

export const createMutation = `
  mutation CreateDocumentType($input: CreateDocumentTypeInput!) {
    createDocumentType(createDocumentTypeInput: $input) {
      id
      name
      legalType
      createdAt
      updatedAt
    }
  }
`;
