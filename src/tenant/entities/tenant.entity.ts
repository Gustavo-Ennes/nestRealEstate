import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  AllowNull,
  AutoIncrement,
  Column,
  Model,
  PrimaryKey,
  Table,
  DataType,
  Default,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { TenantType } from '../enum/tenant-type';
import { Document } from '../../document/entities/document.entity';
import { EOwnerType } from '../../document/enum/owner-type.enum';

@ObjectType()
@Table
export class Tenant extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  @Field(() => Int)
  id: number;

  @Column
  @Field(() => String)
  name: string;

  @AllowNull
  @Column
  @Field(() => String, { nullable: true })
  cpf: string;

  @AllowNull
  @Column
  @Field(() => String, { nullable: true })
  cnpj: string;

  @Column
  @Field(() => String)
  email: string;

  @Column
  @Field(() => String)
  phone: string;

  @Default(true)
  @Column
  @Field(() => Boolean, { defaultValue: true })
  isActive: boolean;

  @Column(DataType.JSON)
  @Field(() => [String], { nullable: true })
  annotations: JSON;

  // Expor o campo createdAt no GraphQL
  @CreatedAt
  @Field(() => Date)
  createdAt: Date;

  // Expor o campo updatedAt no GraphQL
  @UpdatedAt
  @Field(() => Date)
  updatedAt: Date;

  @Field(() => String)
  get tenantType(): TenantType {
    return this.cpf ? TenantType.Natural : TenantType.Legal;
  }

  @Field(() => [Document])
  get documents(): Promise<Document[]> {
    return Document.findAll({
      where: { ownerId: this.id, ownerType: EOwnerType.Tenant },
    });
  }
}
