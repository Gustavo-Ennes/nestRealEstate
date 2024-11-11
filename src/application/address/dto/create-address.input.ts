import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';

@InputType()
export class CreateAddressInput {
  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  street: string;

  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  number: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  complement?: string;

  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  neighborhood: string;

  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  city: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Z]{2}$/, {
    message:
      'The "state" field must be the state abbreviation in uppercase letters.',
  })
  @Field(() => String)
  state: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  additionalInfo?: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9]{8}$/, {
    message: 'The "postalCode" field must be in the format 00000000.',
  })
  @Field(() => String)
  postalCode: string;
}
