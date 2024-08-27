import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class TenantSchema {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => String)
  cpf: string;

  @Field(() => String)
  cnpj: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  phone: string;
}
