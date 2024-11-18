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
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Address } from '../../address/entities/address.entity';
import { User } from '../../user/entities/user.entity';
import { Tenant } from '../../../domain/tenant/entities/tenant.entity';
import { Landlord } from '../../../domain/landlord/entities/landlord.entity';

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

  @BelongsTo(() => Address)
  @Field(() => Address)
  address: Address;

  @Column
  @Field(() => String, { nullable: true })
  observation?: string;

  @CreatedAt
  @Field(() => Date)
  createdAt: Date;

  @UpdatedAt
  @Field(() => Date)
  updatedAt: Date;

  @HasMany(() => User)
  @Field(() => [User], { nullable: true })
  users: User[];

  @HasMany(() => Tenant)
  @Field(() => [Tenant], { nullable: true })
  tenants: Tenant[];

  @HasMany(() => Landlord)
  @Field(() => [Landlord], { nullable: true })
  landlords: Landlord[];
}
