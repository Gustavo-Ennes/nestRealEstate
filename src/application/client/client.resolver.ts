import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ClientService } from './client.service';
import { Client } from './entities/client.entity';
import { CreateClientInput } from './dto/create-client.input';
import { UpdateClientInput } from './dto/update-client.input';
import { UseGuards, UsePipes } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/role/role.guard';
import { validationPipe } from '../pipes/validation.pipe';
import { ERole } from '../auth/role/role.enum';
import { Roles } from '../auth/role/role.decorator';

@UseGuards(AuthGuard, RolesGuard)
@UsePipes(validationPipe)
@Resolver(() => Client)
export class ClientResolver {
  constructor(private readonly clientService: ClientService) {}

  @Roles(ERole.Superadmin)
  @Mutation(() => Client)
  createClient(
    @Args('createClientInput') createClientInput: CreateClientInput,
  ) {
    return this.clientService.create(createClientInput);
  }

  @Roles(ERole.Superadmin)
  @Query(() => [Client], { name: 'clients' })
  findAll() {
    return this.clientService.findAll();
  }

  @Query(() => Client, { name: 'client', nullable: true })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.clientService.findOne(id);
  }

  @Roles(ERole.Superadmin)
  @Mutation(() => Client)
  updateClient(
    @Args('updateClientInput') updateClientInput: UpdateClientInput,
  ) {
    return this.clientService.update(updateClientInput);
  }

  @Roles(ERole.Superadmin)
  @Mutation(() => Boolean)
  removeClient(@Args('id', { type: () => Int }) id: number) {
    return this.clientService.remove(id);
  }
}
