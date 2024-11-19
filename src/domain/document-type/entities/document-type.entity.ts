import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  AutoIncrement,
  Column,
  CreatedAt,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { DocumentRequirement } from '../../document-requirement/entities/document-requirement.entity';

@Table
@ObjectType()
export class DocumentType extends Model<DocumentType> {
  @PrimaryKey
  @AutoIncrement
  @Column
  @Field(() => Int)
  id: number;

  @HasMany(() => DocumentRequirement)
  @Field(() => [DocumentRequirement])
  documentRequirements: DocumentRequirement[];

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
