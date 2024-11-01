export const createMutation = `
  mutation CreateClient($input: CreateClientInput!) {
    createClient(createClientInput: $input) {
      id
      userId
      user {
        id
        username
      }
      name
      phone
      email
      site
      cnpj
      isActive
      observation
    }
  }
`;

export const updateMutation = `
  mutation UpdateClient($input: UpdateClientInput!) {
    updateClient(updateClientInput: $input) {
      id
      userId
      user {
        id
        username
      }
      name
      phone
      email
      site
      cnpj
      isActive
      observation
    }
  }
`;

export const findAllQuery = `
  query Clients {
    clients {    
      id
      userId
      user {
        id
        username
      }
      name
      phone
      email
      site
      cnpj
      isActive
      observation
    }
  }
`;

export const findOneQuery = `
  query Client($input: Int!) {
    client(id: $input) {    
      id
      userId
      user {
        id
        username
      }
      name
      phone
      email
      site
      cnpj
      isActive
      observation 
    }
  }
`;

export const deleteMutation = `
  mutation DeleteClient($input: Int!) {
    removeClient(id: $input)
  }
`;
