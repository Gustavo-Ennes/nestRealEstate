import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { TenantService } from './tenant.service';
import { CreateTenantInput } from './dto/create-tenant.input';
import { UpdateTenantInput } from './dto/update-tenant.input';
import { TenantSchema } from './schema/tenant-schema';

@Resolver(() => TenantSchema)
export class TenantResolver {
  constructor(private readonly tenantService: TenantService) {}

  @Mutation(() => TenantSchema)
  createTenant(
    @Args('createTenantInput') createTenantInput: CreateTenantInput,
  ) {
    return this.tenantService.create(createTenantInput);
  }

  @Query(() => [TenantSchema], { name: 'tenants' })
  findAll() {
    return this.tenantService.findAll();
  }

  @Query(() => TenantSchema, { name: 'tenant' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.tenantService.findOne(id);
  }

  @Mutation(() => TenantSchema)
  updateTenant(
    @Args('updateTenantInput') updateTenantInput: UpdateTenantInput,
  ) {
    return this.tenantService.update(updateTenantInput.id, updateTenantInput);
  }

  @Mutation(() => TenantSchema)
  removeTenant(@Args('id', { type: () => Int }) id: number) {
    return this.tenantService.remove(id);
  }
}
