import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  AutoIncrement,
  Column,
  CreatedAt,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

@Table
@ObjectType()
export class DocumentType extends Model<DocumentType> {
  @PrimaryKey
  @AutoIncrement
  @Column
  @Field(() => Int)
  id: number;

  @Column
  @Field(() => String)
  name: string; // EDocumentType

  @Column
  @Field(() => String)
  legalType: string; //  ELegalType

  @CreatedAt
  @Field(() => Date)
  createdAt: Date;

  @UpdatedAt
  @Field(() => Date)
  updatedAt: Date;
}
