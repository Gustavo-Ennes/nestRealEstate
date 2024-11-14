import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AddressService } from './address.service';
import { Address } from './entities/address.entity';
import { CreateAddressInput } from './dto/create-address.input';
import { UpdateAddressInput } from './dto/update-address.input';
import { UseGuards, UsePipes } from '@nestjs/common';
import { validationPipe } from '../pipes/validation.pipe';
import { RolesGuard } from '../auth/role/role.guard';
import { ERole } from '../auth/role/role.enum';
import { Roles } from '../auth/role/role.decorator';
import { AuthGuard } from '../auth/auth.guard';

@UsePipes(validationPipe)
@Resolver(() => Address)
export class AddressResolver {
  constructor(private readonly addressService: AddressService) {}

  @Mutation(() => Address)
  createAddress(
    @Args('createAddressInput') createAddressInput: CreateAddressInput,
  ) {
    return this.addressService.create(createAddressInput);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ERole.Superadmin)
  @Query(() => [Address], { name: 'addresses' })
  findAll() {
    return this.addressService.findAll();
  }

  @Query(() => Address, { name: 'address', nullable: true })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.addressService.findOne(id);
  }

  @Mutation(() => Address)
  updateAddress(
    @Args('updateAddressInput') updateAddressInput: UpdateAddressInput,
  ) {
    return this.addressService.update(updateAddressInput);
  }

  @Mutation(() => Boolean)
  removeAddress(@Args('id', { type: () => Int }) id: number) {
    return this.addressService.remove(id);
  }
}
