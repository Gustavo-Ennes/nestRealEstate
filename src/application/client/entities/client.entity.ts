import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Table,
  PrimaryKey,
  AutoIncrement,
  Column,
  Model,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { Address } from '../../address/entities/address.entity';

@ObjectType()
@Table
export class Client extends Model<Client> {
  @PrimaryKey
  @AutoIncrement
  @Column
  @Field(() => Int)
  id: number;

  @Column
  @Field(() => String)
  name: string;

  @Column
  @Field(() => String)
  phone: string;

  @Column
  @Field(() => String)
  email: string;

  @Column
  @Field(() => String, { nullable: true })
  site?: string;

  @Column
  @Field(() => String)
  cnpj: string;

  @Column
  @Field(() => Boolean, { defaultValue: true })
  isActive: boolean;

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

  @Column
  @Field(() => String, { nullable: true })
  observation?: string;

  @CreatedAt
  @Field(() => Date)
  createdAt: Date;

  @UpdatedAt
  @Field(() => Date)
  updatedAt: Date;
}
