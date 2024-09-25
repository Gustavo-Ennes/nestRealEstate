export const findOneQuery = `
  query {
    landlord(id: 1) {
      id
      name
      email
      phone
      cpf
      documents {
        id
        type
      }
    }
  }`;

export const findAllQuery = `
  query {
    landlords {
      id
      name
      email
      phone
      cpf
    }
  }
`;

export const createMutation = `
  mutation CreateLandlord($input: CreateLandlordInput!){
    createLandlord(createLandlordInput: $input) {
      id
      name
      email
      phone
      cpf
    }
  }`;

export const updateMutation = `
  mutation UpdateLandlord($input: UpdateLandlordInput!){
    updateLandlord(updateLandlordInput: $input){
      id
      name
      email
      phone
      cpf
    }
  }
`;

export const deleteMutation = `
  mutation DeleteLandlord($input: Int!) {
    removeLandlord(id: $input)
  }
`;
