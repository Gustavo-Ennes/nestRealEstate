import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateAddressInput } from './dto/create-address.input';
import { UpdateAddressInput } from './dto/update-address.input';
import { Address } from './entities/address.entity';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class AddressService {
  constructor(
    @InjectModel(Address) private readonly addressModel: typeof Address,
  ) {}

  private readonly logger = new Logger(AddressService.name);

  async create(createAddressInput: CreateAddressInput) {
    try {
      const address = await this.addressModel.create(createAddressInput);

      return address;
    } catch (error) {
      this.logger.error(
        `${this.create.name} -> ${error.message}`,
        error.stack,
        { createAddressInput },
      );
      throw error;
    }
  }

  async findAll() {
    try {
      const addresses = await this.addressModel.findAll();

      return addresses;
    } catch (error) {
      this.logger.error(
        `${this.findAll.name} -> ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const address = await this.addressModel.findByPk(id);

      return address;
    } catch (error) {
      this.logger.error(
        `${this.findOne.name} -> ${error.message}`,
        error.stack,
        {
          id,
        },
      );
      throw error;
    }
  }

  async update(updateAddressInput: UpdateAddressInput) {
    try {
      const { id } = updateAddressInput;
      const addressToUpdate = await this.addressModel.findByPk(id);

      if (!addressToUpdate)
        throw new NotFoundException('Address not found with provided id.');

      await this.addressModel.update(updateAddressInput, { where: { id } });
      await addressToUpdate.reload();

      return addressToUpdate;
    } catch (error) {
      this.logger.error(
        `${this.update.name} -> ${error.message}`,
        error.stack,
        {
          updateAddressInput,
        },
      );
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const addressToRemove = await this.addressModel.findByPk(id);

      if (!addressToRemove)
        throw new NotFoundException('Address not found with provided id.');

      await addressToRemove.destroy();
      return true;
    } catch (error) {
      this.logger.error(
        `${this.remove.name} -> ${error.message}`,
        error.stack,
        {
          id,
        },
      );
      throw error;
    }
  }
}
