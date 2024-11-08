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
    }
  }
`;

export const deleteMutation = `
  mutation DeleteTenant($input: Int!) {
    removeTenant(id: $input)
  }
`;
