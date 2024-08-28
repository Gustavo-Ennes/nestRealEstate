import { Injectable, Logger } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserInput } from './dto/create-user.input';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  private readonly logger = new Logger(UserService.name);

  async findOne(username: string): Promise<User | undefined> {
    try {
      return await this.userModel.findOne({ where: { username } });
    } catch (error) {
      this.logger.error(
        `${this.findOne.name} -> ${error.message}`,
        error.stack,
        { username },
      );
    }
  }

  async create(createUserInput: CreateUserInput): Promise<User> {
    try {
      return await this.userModel.create(createUserInput as any);
    } catch (error) {
      this.logger.error(
        `${this.create.name} -> ${error.message}`,
        error.stack,
        { createUserInput },
      );
    }
  }
}
