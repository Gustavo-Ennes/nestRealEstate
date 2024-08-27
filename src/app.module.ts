import { Module } from '@nestjs/common';
import { TenantModule } from './tenant/tenant.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'sa',
      password: '1Senha!.',
      database: 'realEstate',
      autoLoadModels: true,
      synchronize: true,
    }),
    TenantModule,
  ],
})
export class AppModule {}
