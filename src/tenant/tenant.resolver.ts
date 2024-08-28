import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { TenantService } from './tenant.service';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantInput } from './dto/create-tenant.input';
import { UpdateTenantInput } from './dto/update-tenant.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Resolver(() => Tenant)
export class TenantResolver {
  constructor(private readonly tenantService: TenantService) {}

  @Mutation(() => Tenant)
  createTenant(
    @Args('createTenantInput') createTenantInput: CreateTenantInput,
  ) {
    return this.tenantService.create(createTenantInput);
  }

  @Query(() => [Tenant], { name: 'tenants' })
  findAll() {
    return this.tenantService.findAll();
  }

  @Query(() => Tenant, { name: 'tenant' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.tenantService.findOne(id);
  }

  @Mutation(() => Tenant)
  updateTenant(
    @Args('updateTenantInput') updateTenantInput: UpdateTenantInput,
  ) {
    return this.tenantService.update(updateTenantInput.id, updateTenantInput);
  }

  @Mutation(() => Tenant)
  removeTenant(@Args('id', { type: () => Int }) id: number) {
    return this.tenantService.remove(id);
  }
}
