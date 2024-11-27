import {
  Injectable,
  ConflictException,
  Logger,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserInput } from '../user/dto/create-user.input';
import { hashPassword, verifyPassword } from './auth.utils';
import { User } from '../user/entities/user.entity';
import { LoginInput } from './dto/login.input';
import { AuthReturn } from './auth.utils';
import { ClientService } from '../client/client.service';
import { ERole } from './role/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private clientService: ClientService,
    private jwtService: JwtService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  async signUp(createUserInput: CreateUserInput): Promise<AuthReturn> {
    try {
      const { username, password, email, role, clientId } = createUserInput;

      if (!clientId && role !== ERole.Superadmin)
        throw new BadRequestException(
          'Non superadmin users must have a clientId',
        );

      const sameUsernameUser = await this.usersService.findOne(username);
      const client = await this.clientService.findOne(clientId);

      if (sameUsernameUser)
        throw new ConflictException(`Username ${username} already taken.`);

      if (!client && role !== ERole.Superadmin)
        throw new NotFoundException('Client not found with provided id.');

      const hashedPassword = await hashPassword(password);
      const user: User = await this.usersService.create({
        username,
        email,
        password: hashedPassword,
        role,
        clientId,
      });

      const payload = { sub: user.id, username, email, role, client };
      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      this.logger.error(
        `${this.signUp.name} -> ${error.message}`,
        error.stack,
        { createUserInput },
      );
      throw error;
    }
  }

  async login(loginInput: LoginInput): Promise<AuthReturn> {
    try {
      const { username, password } = loginInput;
      const user = await this.usersService.findOne(username);
      if (!user)
        throw new NotFoundException(`No user found with username ${username}`);

      if (!(await verifyPassword(password, user.password)))
        throw new UnauthorizedException(
          `Password didn't match for user ${username}`,
        );

      const { id, email, role, client } = user;
      const payload = {
        sub: id,
        username,
        email,
        role,
        client,
      };
      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      this.logger.error(`${this.login.name} -> ${error.message}`, error.stack, {
        loginInput,
      });
      throw error;
    }
  }

  async hashPassword(str: string): Promise<string> {
    return await hashPassword(str);
  }
}
