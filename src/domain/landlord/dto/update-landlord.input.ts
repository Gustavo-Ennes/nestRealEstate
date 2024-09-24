import { CreateLandlordInput } from './create-landlord.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateLandlordInput extends PartialType(CreateLandlordInput) {
  @Field(() => Int)
  id: number;

  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;

  @Field(() => [String], { nullable: true })
  annotations?: JSON;
}
