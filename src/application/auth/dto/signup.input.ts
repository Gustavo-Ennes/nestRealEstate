import { InputType, Field } from '@nestjs/graphql';
import { IsValidUsername } from '../validation/username.validation';
import { IsValidPassword } from '../validation/password.validation';
import { IsEmail } from '../../../validations/email.validation';
import { IsValidRole } from '../validation/role.validation';

@InputType()
export class SignUpInput {
  @IsValidUsername
  @Field(() => String)
  username: string;

  @IsValidPassword
  @Field(() => String)
  password: string;

  @IsEmail
  @Field(() => String)
  email: string;

  @IsValidRole
  @Field(() => String)
  role: string;
}
