import { IsNumber } from 'class-validator';
import { CreateTenantInput } from './create-tenant.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateTenantInput extends PartialType(CreateTenantInput) {
  @IsNumber()
  @Field(() => Int, { nullable: false })
  id: number;

  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;

  @Field(() => [String], { nullable: true })
  annotations?: JSON;
}
