export const signUpMutation = `
  mutation SignUp($input: SignUpInput!){
    signUp(signUpInput: $input) {
      access_token
    }
  } 
`;

export const loginMutation = `
  mutation Login($input: LoginInput!){
    login(loginInput: $input){
      access_token
    }
  }
`;
