export const createMutation = `
  mutation CreateClient($input: CreateClientInput!) {
    createClient(createClientInput: $input) {
      id
      name
      phone
      email
      site
      cnpj
      isActive
      observation
      address {
        id
      }
      addressId
      createdAt
      updatedAt
    }
  }
`;

export const updateMutation = `
  mutation UpdateClient($input: UpdateClientInput!) {
    updateClient(updateClientInput: $input) {
      id
      name
      phone
      email
      site
      cnpj
      isActive
      observation
      address {
        id
      }
      addressId
      createdAt
      updatedAt
    }
  }
`;

export const findAllQuery = `
  query Clients {
    clients {    
      id
      name
      phone
      email
      site
      cnpj
      isActive
      observation
      address {
        id
      }
      addressId
      createdAt
      updatedAt
    }
  }
`;

export const findOneQuery = `
  query Client($input: Int!) {
    client(id: $input) {    
      id
      name
      phone
      email
      site
      cnpj
      isActive
      observation 
      address {
        id
      }
      addressId
      createdAt
      updatedAt
    }
  }
`;

export const deleteMutation = `
  mutation DeleteClient($input: Int!) {
    removeClient(id: $input)
  }
`;
