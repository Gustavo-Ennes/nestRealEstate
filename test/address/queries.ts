export const createMutation = `
  mutation CreateAddress($input: CreateAddressInput!) {
    createAddress(createAddressInput: $input) {
      id
      street
      number
      complement
      neighborhood
      city
      state
      additionalInfo
      postalCode
      tenant {
        id
      }
      landlord {
        id
      }
      client {
        id
      }
    }
  }
`;

export const updateMutation = `
  mutation UpdateAddress($input: UpdateAddressInput!) {
    updateAddress(updateAddressInput: $input) {
      id
      street
      number
      complement
      neighborhood
      city
      state
      additionalInfo
      postalCode 
      tenant {
        id
      }
      landlord {
        id
      }
      client {
        id
      }
    }
  }
`;

export const findOneQuery = `
  query Address ($input: Int!) {
    address(id: $input) {
      id
      street
      number
      complement
      neighborhood
      city
      state
      additionalInfo
      postalCode 
      tenant {
        id
      }
      landlord {
        id
      }
      client {
        id
      }
    }
  }
`;

export const findAllQuery = `
  query Addresses {
    addresses {
      id
      street
      number
      complement
      neighborhood
      city
      state
      additionalInfo
      postalCode 
      tenant {
        id
      }
      landlord {
        id
      }
      client {
        id
      }
    }
  }
`;

export const removeMutation = `
  mutation RemoveAddress($input: Int!) {
    removeAddress(id: $input)  
  }
`;
