import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  AutoIncrement,
  Column,
  Model,
  PrimaryKey,
  Table,
  ForeignKey,
} from 'sequelize-typescript';
import { Client } from '../../client/entities/client.entity';

@ObjectType()
@Table
export class User extends Model<User> {
  @PrimaryKey
  @AutoIncrement
  @Column
  @Field(() => Int)
  id: number;

  @Column
  @Field(() => String)
  username: string;

  @Column
  @Field(() => String)
  password: string;

  @Column({ unique: true })
  @Field(() => String)
  email: string;

  @Column({ defaultValue: true })
  @Field(() => Boolean)
  isActive: boolean;

  @Column
  @Field(() => String)
  role: string;

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
}
