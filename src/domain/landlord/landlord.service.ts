import {
  BadRequestException,
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
import { ELegalType } from '../enum/legal-type.enum';
import { ClientService } from '../../application/client/client.service';
import { Client } from '../../application/client/entities/client.entity';
import { AddressService } from '../../application/address/address.service';
import { Address } from '../../application/address/entities/address.entity';
import { CacheService } from '../../application/cache/cache.service';
import { ModuleNames } from '../../application/cache/cache.utils';

@Injectable()
export class LandlordService {
  constructor(
    @InjectModel(Landlord)
    private readonly landlordModel: typeof Landlord,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private readonly clientService: ClientService,
    private readonly addressService: AddressService,
    private readonly cacheService: CacheService,
  ) {}

  private readonly logger = new Logger(LandlordService.name);
  private readonly includeOptions = {
    include: [{ model: Address }, { model: Client }],
  };

  async create(createLandlordDto: CreateLandlordInput): Promise<Landlord> {
    try {
      const { addressId, clientId } = createLandlordDto;
      const client = await this.clientService.findOne(clientId);
      const address = await this.addressService.findOne(addressId);

      if (!client)
        throw new NotFoundException('Client not found with provided id.');

      if (!address)
        throw new NotFoundException(
          'No address found with provided addressId.',
        );
      if (address.isAssociated)
        throw new BadRequestException(
          'Address already associated to another entity.',
        );

      const newLandlord: Landlord =
        await this.landlordModel.create(createLandlordDto);
      await newLandlord.reload(this.includeOptions);
      const landlords: Landlord[] = await this.landlordModel.findAll({
        include: [{ model: Address }],
      });

      await this.cacheManager.set(`landlord:${newLandlord.id}`, newLandlord);
      await this.cacheManager.set(
        'landlords',
        landlords.sort((a, b) => a.id - b.id),
      );

      await this.cacheService.insertOrUpdateCache({
        moduleName: ModuleNames.Landlord,
        createdOrUpdated: newLandlord,
        allEntities: landlords,
      });

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
        (await this.cacheService.getFromCache(
          ModuleNames.Landlord,
        )) as Landlord[];
      if (cacheLandlords) return cacheLandlords;

      const landlords: Landlord[] = await this.landlordModel.findAll(
        this.includeOptions,
      );

      await this.cacheService.insertOrUpdateCache({
        moduleName: ModuleNames.Landlord,
        allEntities: landlords,
      });

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
      const cacheLandlords: Landlord | null =
        (await this.cacheService.getFromCache(
          ModuleNames.Landlord,
          id,
        )) as Landlord;

      if (cacheLandlords) return cacheLandlords;

      const landlord: Landlord = await this.landlordModel.findByPk(
        id,
        this.includeOptions,
      );

      await this.cacheService.insertOrUpdateCache({
        moduleName: ModuleNames.Landlord,
        createdOrUpdated: landlord,
      });

      return landlord;
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
      let client: Client;
      let address: Address;
      const { id, addressId, clientId, cpf, cnpj } = updateLandlordDto;
      const landlord = await this.landlordModel.findOne({
        where: { id },
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
        (landlordType === ELegalType.Legal && cpf?.length > 0) ||
        (landlordType === ELegalType.Natural && cnpj?.length > 0)
      )
        throw new ConflictException(
          'Cannot update a cpf of a legal landlord or the cnpj of a natural landlord.',
        );

      if (clientId) {
        client = await this.clientService.findOne(clientId);
      }
      if (clientId && !client)
        throw new NotFoundException('Client not found with provided id.');

      if (addressId) address = await this.addressService.findOne(addressId);
      if (addressId && !address)
        throw new NotFoundException(
          'No address found with provided addressId.',
        );

      if (address && address.isAssociated)
        throw new BadRequestException(
          'Address already associated to another entity.',
        );

      await landlord.update(updateLandlordDto);
      const landlords: Landlord[] = await this.landlordModel.findAll(
        this.includeOptions,
      );

      await this.cacheService.insertOrUpdateCache({
        moduleName: ModuleNames.Landlord,
        createdOrUpdated: landlord,
        allEntities: landlords,
      });

      await landlord.reload(this.includeOptions);

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
      const landlords = await this.landlordModel.findAll(this.includeOptions);

      await this.cacheService.insertOrUpdateCache({
        moduleName: ModuleNames.Landlord,
        allEntities: landlords,
      });
      await this.cacheService.deleteOneFromCache(ModuleNames.Landlord, id);

      return true;
    } catch (error) {
      this.logger.error(
        `${this.remove.name} -> ${error.message}`,
        error.stack,
        { id },
      );
      throw error;
    }
  }
}
