import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class FileOutput {
  @Field(() => String)
  jobId: string;
}
