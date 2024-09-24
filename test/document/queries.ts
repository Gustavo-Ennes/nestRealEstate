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
