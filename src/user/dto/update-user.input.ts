import { IsNumberString } from 'class-validator';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateUserInput } from './create-user.input';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @IsNumberString()
  @Field(() => Int, { nullable: false })
  id: number;
}
