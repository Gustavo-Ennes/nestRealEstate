import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { TenantService } from './tenant.service';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantInput } from './dto/create-tenant.input';
import { UpdateTenantInput } from './dto/update-tenant.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/role/role.decorator';
import { Role } from 'src/auth/role/role.enum';
import { RolesGuard } from 'src/auth/role/role.guard';

@UseGuards(AuthGuard, RolesGuard)
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
  @Roles(Role.Admin)
  findAll() {
    return this.tenantService.findAll();
  }

  @Query(() => Tenant, { name: 'tenant' })
  @Roles(Role.Admin)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.tenantService.findOne(id);
  }

  // @Query(() => Tenant, { name: 'tenantByLandlord' })
  // @Roles(Role.Landlord, Role.Admin)
  // findTenantsByLandlord(@Args('id', { type: () => Int }) id: number) {
  //   return this.tenantService.findOne({where:{landlordId: id}});
  // }

  @Mutation(() => Tenant)
  @Roles(Role.Tenant, Role.Admin)
  updateTenant(
    @Args('updateTenantInput') updateTenantInput: UpdateTenantInput,
  ) {
    return this.tenantService.update(updateTenantInput.id, updateTenantInput);
  }

  @Mutation(() => Tenant)
  @Roles(Role.Tenant, Role.Admin)
  removeTenant(@Args('id', { type: () => Int }) id: number) {
    return this.tenantService.remove(id);
  }
}
