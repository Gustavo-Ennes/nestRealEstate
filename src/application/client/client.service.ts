import {
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { CreateClientInput } from './dto/create-client.input';
import { UpdateClientInput } from './dto/update-client.input';
import { InjectModel } from '@nestjs/sequelize';
import { Client } from './entities/client.entity';
import { UserService } from '../user/user.service';
import { ERole } from '../auth/role/role.enum';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ClientService {
  constructor(
    @InjectModel(Client) private readonly clientModel: typeof Client,
    private readonly userService: UserService,
  ) {}

  private readonly logger = new Logger(ClientService.name);

  async create(createClientInput: CreateClientInput) {
    try {
      const { userId } = createClientInput;
      const user = await this.userService.findById(userId);

      if (!user)
        throw new NotFoundException('User not found with provided userId.');
      if (user.role !== ERole.Admin)
        throw new NotAcceptableException("User must have 'admin' role.");

      const client = await this.clientModel.create(createClientInput);
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
      const clients = await this.clientModel.findAll();
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
      const client = await this.clientModel.findByPk(id);
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
      let user: User;
      const { id, userId } = updateClientInput;
      const clientToUpdate = await this.clientModel.findByPk(id);

      if (!clientToUpdate)
        throw new NotFoundException('No client found with provided id.');

      if (userId) {
        user = await this.userService.findById(userId);
      }
      if (!user && userId)
        throw new NotFoundException('No user found with provided userId.');
      if (user && user.role !== ERole.Admin)
        throw new NotAcceptableException("User must have 'admin' role.");

      await this.clientModel.update(updateClientInput, { where: { id } });
      await clientToUpdate.reload();

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
