import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { TenantService } from './tenant.service';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantInput } from './dto/create-tenant.input';
import { UpdateTenantInput } from './dto/update-tenant.input';
import { UseGuards, UsePipes } from '@nestjs/common';
import { AuthGuard } from '../../application/auth/auth.guard';
import { Roles } from '../../application/auth/role/role.decorator';
import { ERole } from '../../application/auth/role/role.enum';
import { RolesGuard } from '../../application/auth/role/role.guard';
import { validationPipe } from '../../application/pipes/validation.pipe';

@UseGuards(AuthGuard, RolesGuard)
@UsePipes(validationPipe)
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
  @Roles(ERole.Admin)
  findAll() {
    return this.tenantService.findAll();
  }

  @Query(() => Tenant, { name: 'tenant', nullable: true })
  @Roles(ERole.Admin)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.tenantService.findOne(id);
  }

  // @Query(() => Tenant, { name: 'tenantByLandlord' })
  // @Roles(ERole.Landlord, ERole.Admin)
  // findTenantsByLandlord(@Args('id', { type: () => Int }) id: number) {
  //   return this.tenantService.findOne({where:{landlordId: id}});
  // }

  // if !isActive, update isActive first and do another update as you want
  @Mutation(() => Tenant)
  @Roles(ERole.Tenant, ERole.Admin)
  updateTenant(
    @Args('updateTenantInput') updateTenantInput: UpdateTenantInput,
  ) {
    return this.tenantService.update(updateTenantInput);
  }

  @Mutation(() => Boolean)
  @Roles(ERole.Tenant, ERole.Admin)
  async removeTenant(@Args('id', { type: () => Int }) id: number) {
    await this.tenantService.remove(id);
    return true;
  }
}
