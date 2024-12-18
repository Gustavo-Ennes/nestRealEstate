export const findOneQuery = `
  query {
    tenant(id: 1) {
      id
      name
      email
      phone
      cpf
      cnpj
      documents {
        id
        type
      }
      clientId
      client {
        id
      }
      address {
        id
      }
      addressId
      createdAt
      updatedAt
    }
  }`;

export const findAllQuery = `
  query {
    tenants {
      id
      name
      email
      phone
      cpf
      cnpj
      clientId
      client {
        id
      }
      address {
        id
      }
      addressId
      createdAt
      updatedAt
    }
  }
`;

export const createMutation = `
  mutation CreateTenant($input: CreateTenantInput!){
    createTenant(createTenantInput: $input) {
      id
      name
      email
      phone
      cpf
      cnpj
      clientId
      client {
        id
      }
      address {
        id
      }
      addressId
      createdAt
      updatedAt
    }
  }`;

export const updateMutation = `
  mutation UpdateTenant($input: UpdateTenantInput!){
    updateTenant(updateTenantInput: $input){
      id
      name
      email
      phone
      cpf
      cnpj
      clientId
      client {
        id
      }
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
  mutation DeleteTenant($input: Int!) {
    removeTenant(id: $input)
  }
`;
