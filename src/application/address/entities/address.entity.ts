import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  PrimaryKey,
  Table,
  Column,
  Model,
  AutoIncrement,
} from 'sequelize-typescript';

@ObjectType()
@Table({ tableName: 'Addresses' })
export class Address extends Model<Address> {
  @PrimaryKey
  @AutoIncrement
  @Column
  @Field(() => Int)
  id: number;

  @Column
  @Field(() => String)
  street: string;

  @Column
  @Field(() => String)
  number: string;

  @Column({ allowNull: true })
  @Field(() => String, { nullable: true })
  complement: string;

  @Column
  @Field(() => String)
  neighborhood: string;

  @Column
  @Field(() => String)
  city: string;

  @Column
  @Field(() => String)
  state: string;

  @Column({ allowNull: true })
  @Field({ nullable: true })
  additionalInfo?: string;

  @Column
  @Field(() => String)
  postalCode: string;
}
