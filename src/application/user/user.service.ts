import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserInput } from './dto/create-user.input';
import { Client } from '../client/entities/client.entity';
import { ERole } from '../auth/role/role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  private readonly logger = new Logger(UserService.name);

  async findOne(username: string): Promise<User | undefined> {
    try {
      return await this.userModel.findOne({
        where: { username },
        include: [{ model: Client, include: [{ model: User }] }],
      });
    } catch (error) {
      this.logger.error(
        `${this.findOne.name} -> ${error.message}`,
        error.stack,
        { username },
      );
      throw error;
    }
  }

  async findById(id: number): Promise<User | undefined> {
    try {
      return await this.userModel.findByPk(id, {
        include: [{ model: Client }],
      });
    } catch (error) {
      this.logger.error(
        `${this.findById.name} -> ${error.message}`,
        error.stack,
        { id },
      );
      throw error;
    }
  }

  async create(createUserInput: CreateUserInput): Promise<User> {
    try {
      const { clientId, role } = createUserInput;

      if (!clientId && role !== ERole.Superadmin)
        throw new BadRequestException(
          'Non superadmin users must have a clientId.',
        );

      return await this.userModel.create(createUserInput, {
        include: [{ model: Client }],
      });
    } catch (error) {
      this.logger.error(
        `${this.create.name} -> ${error.message}`,
        error.stack,
        { createUserInput },
      );
      throw error;
    }
  }
}
