import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateTenantInput {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  cpf: string;

  @Field(() => String, { nullable: true })
  cnpj: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  phone: string;
}
