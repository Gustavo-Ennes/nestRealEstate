import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  AutoIncrement,
  Column,
  Model,
  PrimaryKey,
  Table,
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
  name: string; // Ex: 'RG', 'CPF', 'CNH', etc.

  @Column
  @Field(() => String)
  applicableTo: string; // 'individual' ou 'business'
}
