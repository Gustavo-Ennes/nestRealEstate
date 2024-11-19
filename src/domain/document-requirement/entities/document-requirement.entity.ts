import {
  Table,
  ForeignKey,
  Column,
  Model,
  Default,
  AutoIncrement,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
  BelongsTo,
} from 'sequelize-typescript';
import { DocumentType } from '../../document-type/entities/document-type.entity';
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Table
export class DocumentRequirement extends Model<DocumentRequirement> {
  @PrimaryKey
  @AutoIncrement
  @Column
  @Field(() => Int)
  id: number;

  @ForeignKey(() => DocumentType)
  @Column
  @Field(() => Int)
  documentTypeId: number;

  @BelongsTo(() => DocumentType)
  @Field(() => DocumentType)
  documentType: DocumentType;

  @Column
  @Field(() => String)
  role: string; // ERole

  @Default(true)
  @Column
  @Field(() => Boolean, { defaultValue: true })
  isRequired: boolean;

  @CreatedAt
  @Field(() => Date)
  createdAt: Date;

  @UpdatedAt
  @Field(() => Date)
  updatedAt: Date;
}
