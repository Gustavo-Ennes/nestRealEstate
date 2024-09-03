import { InputType, Field } from '@nestjs/graphql';
import { Role } from '../role/role.enum';
import { IsValidUsername } from '../validation/username.validation';
import { IsValidPassword } from '../validation/password.validation';
import { IsEmail } from '../../tenant/validations/email.validation';
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
  @Field(() => Role)
  role: string;
}
