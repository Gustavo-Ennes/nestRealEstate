import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  AutoIncrement,
  Column,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { EDocumentStatus } from '../enum/document-status.enum';

@ObjectType()
@Table
export class Document extends Model {
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

  @Column
  @Field(() => String, { defaultValue: EDocumentStatus.Processing })
  status: string;

  @Column
  @Field(() => String)
  observation: string;

  @Column
  @Field(() => String)
  document: string;
}
