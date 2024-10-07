import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  AutoIncrement,
  Column,
  CreatedAt,
  Default,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { EDocumentStatus } from '../enum/document-status.enum';

@ObjectType()
@Table
export class Document extends Model<Document> {
  @PrimaryKey
  @AutoIncrement
  @Column
  @Field(() => Int)
  id: number;

  @Column
  @Field(() => String)
  type: string;

  @Column
  @Field(() => String)
  ownerType: string;

  @Column
  @Field(() => Int)
  ownerId: number;

  @Default(EDocumentStatus.Processing)
  @Column
  @Field(() => String, { defaultValue: EDocumentStatus.Processing })
  status: string;

  @Column
  @Field(() => String, { nullable: true })
  observation: string;

  @Column
  @Field(() => String)
  url: string;

  // Expor o campo createdAt no GraphQL
  @CreatedAt
  @Field(() => Date)
  createdAt: Date;

  // Expor o campo updatedAt no GraphQL
  @UpdatedAt
  @Field(() => Date)
  updatedAt: Date;
}
