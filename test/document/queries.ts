export const updateMutation = `
  mutation UpdateDocument($input: UpdateDocumentInput!){
    updateDocument(updateDocumentInput: $input) {
      id
      type
      ownerType
      ownerId
      status
      observation
      createdAt
      updatedAt
    }
  }
`;

export const findOneQuery = `
  query Document($input: Int!) {
    document(id: $input) {
      id
      type
      ownerType
      ownerId
      status
      observation
      createdAt
      updatedAt
    }
  }
`;

export const deleteMutation = `
  mutation RemoveDocument($input: Int!) {
    removeDocument(id: $input)
  }
`;
