import { IsNumberString } from 'class-validator';
import { CreateTenantInput } from './create-tenant.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateTenantInput extends PartialType(CreateTenantInput) {
  @IsNumberString()
  @Field(() => Int, { nullable: false })
  id: number;
}
