import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { CreateLandlordInput } from './dto/create-landlord.input';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { InjectModel } from '@nestjs/sequelize';
import { Landlord } from './entities/landlord.entity';
import { UpdateLandlordInput } from './dto/update-landlord.input';
import { ELandlordType } from './enum/landlord-type.enum';

@Injectable()
export class LandlordService {
  constructor(
    @InjectModel(Landlord)
    private readonly landlordModel: typeof Landlord,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  private readonly logger = new Logger(LandlordService.name);

  async create(createLandlordDto: CreateLandlordInput): Promise<Landlord> {
    try {
      const newLandlord: Landlord = await this.landlordModel.create(
        createLandlordDto as any,
      );

      await this.cacheManager.set(`landlord:${newLandlord.id}`, newLandlord);
      const landlords: Landlord[] = await this.landlordModel.findAll();
      await this.cacheManager.set(
        'landlords',
        landlords.sort((a, b) => a.id - b.id),
      );

      return newLandlord;
    } catch (error) {
      this.logger.error(
        `${this.create.name} -> ${error.message}`,
        error.stack,
        { createLandlordDto },
      );
      throw error;
    }
  }

  async findAll(): Promise<Landlord[]> {
    try {
      const cacheLandlords: Landlord[] | null =
        await this.cacheManager.get('landlords');
      if (cacheLandlords) return cacheLandlords;

      const landlords: Landlord[] = await this.landlordModel.findAll();
      await this.cacheManager.set(
        'landlords',
        landlords.sort((a, b) => a.id - b.id),
      );
      return landlords;
    } catch (error) {
      this.logger.error(
        `${this.findAll.name} -> ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOne(id: number): Promise<Landlord> {
    try {
      const cacheLandlords: Landlord | null = await this.cacheManager.get(
        `landlords:${id}`,
      );
      if (cacheLandlords) return cacheLandlords;

      const landlord: Landlord = await this.landlordModel.findByPk(id);
      await this.cacheManager.set(`landlord:${id}`, landlord);
      return await this.landlordModel.findByPk(id);
    } catch (error) {
      this.logger.error(
        `${this.findOne.name} -> ${error.message}`,
        error.stack,
        { id },
      );
      throw error;
    }
  }

  async update(updateLandlordDto: UpdateLandlordInput): Promise<Landlord> {
    try {
      const landlord = await this.landlordModel.findOne({
        where: { id: updateLandlordDto.id },
      });
      const { landlordType } = landlord;

      if (!landlord) throw new NotFoundException('No landlord found.');

      const dtoKeys = Object.keys(updateLandlordDto);
      if (
        landlord.isActive === false &&
        (dtoKeys.length !== 2 || !dtoKeys.includes('isActive'))
      )
        throw new NotAcceptableException(
          'Landlord is not active. First update with only id and isActive=true, after update other properties in another call.',
        );

      if (
        (landlordType === ELandlordType.Legal &&
          updateLandlordDto.cpf?.length > 0) ||
        (landlordType === ELandlordType.Natural &&
          updateLandlordDto.cnpj?.length > 0)
      )
        throw new ConflictException(
          'Cannot update a cpf of a legal landlord or the cnpj of a natural landlord.',
        );

      await landlord.update(updateLandlordDto);
      await this.cacheManager.set(`landlord:${updateLandlordDto.id}`, landlord);
      const landlords: Landlord[] = await this.landlordModel.findAll();
      await this.cacheManager.set(
        'landlords',
        landlords.sort((a, b) => a.id - b.id),
      );
      await landlord.reload();
      return landlord;
    } catch (error) {
      this.logger.error(
        `${this.update.name} -> ${error.message}`,
        error.stack,
        { updateLandlordDto },
      );
      throw error;
    }
  }

  async remove(id: number): Promise<boolean> {
    try {
      const landlord = await this.findOne(id);
      if (!landlord) throw new NotFoundException('Landlord not found.');

      await landlord.destroy();
      return true;
    } catch (error) {
      this.logger.error(
        `${this.update.name} -> ${error.message}`,
        error.stack,
        { id },
      );
      throw error;
    }
  }
}
