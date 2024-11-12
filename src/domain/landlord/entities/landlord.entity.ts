import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Table,
  PrimaryKey,
  AutoIncrement,
  Column,
  AllowNull,
  Default,
  DataType,
  CreatedAt,
  UpdatedAt,
  Model,
  ForeignKey,
} from 'sequelize-typescript';
import { ERole } from '../../../application/auth/role/role.enum';
import { Document } from '../../document/entities/document.entity';
import { ELegalType } from '../../enum/legal-type.enum';
import { Client } from '../../../application/client/entities/client.entity';
import { Address } from '../../../application/address/entities/address.entity';

@ObjectType()
@Table
export class Landlord extends Model<Landlord> {
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
  get landlordType(): ELegalType {
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

  @ForeignKey(() => Address)
  @Column
  @Field(() => Int)
  addressId: number;

  @Field(() => Address)
  get address(): Promise<Address> {
    return Address.findOne({
      where: { id: this.addressId },
    });
  }

  @Field(() => [Document])
  get documents(): Promise<Document[]> {
    return Document.findAll({
      where: { ownerId: this.id, ownerRole: ERole.Landlord },
    });
  }
}
