import {
  AllowNull,
  AutoIncrement,
  Column,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table
export class Tenant extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number;

  @Column
  declare name: string;

  @AllowNull
  @Column
  declare cpf: string;

  @AllowNull
  @Column
  declare cnpj: string;

  @Column
  declare email: string;

  @Column
  declare phone: string;
}
