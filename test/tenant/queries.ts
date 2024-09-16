export const findOneQuery = `
  query {
    tenant(id: 1) {
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
    tenants {
      id
      name
      email
      phone
      cpf
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
    }
  }`;

export const updateMutation = `
  mutation UpdateTenant($input: UpdateTenantInput!){
    updateTenant(updateTenantInput: $input)
  }
`;

export const deleteMutation = `
  mutation DeleteTenant($input: Int!) {
    removeTenant(id: $input)
  }
`;
