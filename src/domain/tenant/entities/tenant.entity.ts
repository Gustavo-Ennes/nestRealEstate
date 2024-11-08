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
  ForeignKey,
} from 'sequelize-typescript';
import { ELegalType } from '../../enum/legal-type.enum';
import { Document } from '../../document/entities/document.entity';
import { ERole } from '../../../application/auth/role/role.enum';
import { Client } from '../../../application/client/entities/client.entity';

@ObjectType()
@Table
export class Tenant extends Model<Tenant> {
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

  @CreatedAt
  @Field(() => Date)
  createdAt: Date;

  @UpdatedAt
  @Field(() => Date)
  updatedAt: Date;

  @Field(() => String)
  get tenantType(): ELegalType {
    return this.cpf ? ELegalType.Natural : ELegalType.Legal;
  }

  @ForeignKey(() => Client)
  @Column
  @Field(() => Int)
  clientId: number;

  @Field(() => Client)
  get client(): Promise<Client> {
    return Client.findOne({
      where: { id: this.clientId },
    });
  }

  @Field(() => [Document])
  get documents(): Promise<Document[]> {
    return Document.findAll({
      where: { ownerId: this.id, ownerRole: ERole.Tenant },
    });
  }
}
