import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateClientInput } from './dto/create-client.input';
import { UpdateClientInput } from './dto/update-client.input';
import { InjectModel } from '@nestjs/sequelize';
import { Client } from './entities/client.entity';
import { AddressService } from '../address/address.service';
import { Address } from '../address/entities/address.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ClientService {
  constructor(
    @InjectModel(Client) private readonly clientModel: typeof Client,
    private addressService: AddressService,
  ) {}

  private readonly logger = new Logger(ClientService.name);
  private readonly includeOptions = {
    include: [{ model: Address }, { model: User }],
  };

  async create(createClientInput: CreateClientInput) {
    try {
      const { addressId } = createClientInput;
      const address = await this.addressService.findOne(addressId);

      if (!address)
        throw new NotFoundException(
          'No address found with provided addressId.',
        );
      if (address.isAssociated)
        throw new BadRequestException(
          'Address already associated to another entity.',
        );

      const client = await this.clientModel.create(createClientInput);
      await client.reload(this.includeOptions);

      return client;
    } catch (error) {
      this.logger.error(
        `${this.create.name} -> ${error.message}`,
        error.stack,
        { createClientInput },
      );
      throw error;
    }
  }

  async findAll() {
    try {
      const clients = await this.clientModel.findAll(this.includeOptions);
      return clients;
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
      const client = await this.clientModel.findByPk(id, this.includeOptions);
      return client;
    } catch (error) {
      this.logger.error(
        `${this.findOne.name} -> ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async update(updateClientInput: UpdateClientInput) {
    try {
      let address: Address;
      const { id, addressId } = updateClientInput;
      const clientToUpdate = await this.clientModel.findByPk(id);

      if (!clientToUpdate)
        throw new NotFoundException('No client found with provided id.');

      if (addressId) address = await this.addressService.findOne(addressId);

      if (addressId && !address)
        throw new NotFoundException(
          'No address found with provided addressId.',
        );

      if (address && address.isAssociated)
        throw new BadRequestException(
          'Address already associated to another entity.',
        );

      await this.clientModel.update(updateClientInput, { where: { id } });
      await clientToUpdate.reload(this.includeOptions);

      return clientToUpdate;
    } catch (error) {
      this.logger.error(
        `${this.update.name} -> ${error.message}`,
        error.stack,
        { updateClientInput },
      );
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const clientToRemove = await this.clientModel.findByPk(id);

      if (!clientToRemove)
        throw new NotFoundException('No client found with provided id.');

      await clientToRemove.destroy();
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
