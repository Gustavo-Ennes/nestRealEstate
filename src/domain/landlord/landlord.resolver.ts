import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { LandlordService } from './landlord.service';
import { Landlord } from './entities/landlord.entity';
import { CreateLandlordInput } from './dto/create-landlord.input';
import { UpdateLandlordInput } from './dto/update-landlord.input';
import { UseGuards, UsePipes } from '@nestjs/common';
import { AuthGuard } from '../../application/auth/auth.guard';
import { RolesGuard } from '../../application/auth/role/role.guard';
import { validationPipe } from '../../application/pipes/validation.pipe';
import { Roles } from '../../application/auth/role/role.decorator';
import { ERole } from '../../application/auth/role/role.enum';

@UseGuards(AuthGuard, RolesGuard)
@UsePipes(validationPipe)
@Resolver(() => Landlord)
export class LandlordResolver {
  constructor(private readonly landlordService: LandlordService) {}

  @Mutation(() => Landlord)
  createLandlord(
    @Args('createLandlordInput') createLandlordInput: CreateLandlordInput,
  ) {
    return this.landlordService.create(createLandlordInput);
  }

  @Roles(ERole.Admin)
  @Query(() => [Landlord], { name: 'landlords' })
  findAll() {
    return this.landlordService.findAll();
  }

  @Roles(ERole.Admin, ERole.Landlord)
  @Query(() => Landlord, { name: 'landlord', nullable: true })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.landlordService.findOne(id);
  }

  @Roles(ERole.Admin, ERole.Landlord)
  @Mutation(() => Landlord)
  updateLandlord(
    @Args('updateLandlordInput') updateLandlordInput: UpdateLandlordInput,
  ) {
    return this.landlordService.update(updateLandlordInput);
  }

  @Roles(ERole.Admin, ERole.Landlord)
  @Mutation(() => Boolean)
  removeLandlord(@Args('id', { type: () => Int }) id: number) {
    return this.landlordService.remove(id);
  }
}
