import {
  Injectable,
  ConflictException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserInput } from '../user/dto/create-user.input';
import { hashPassword, verifyPassword } from './auth.utils';
import { User } from '../user/entities/user.entity';
import { LoginInput } from './dto/login.input';
import { AuthReturn } from './auth.utils';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  async signUp(createUserInput: CreateUserInput): Promise<AuthReturn> {
    try {
      const { username, password, email, role } = createUserInput;
      const sameUsernameUser = await this.usersService.findOne(username);

      if (sameUsernameUser)
        throw new ConflictException(`Username ${username} already taken.`);

      const hashedPassword = await hashPassword(password);
      const user: User = await this.usersService.create({
        username,
        email,
        password: hashedPassword,
        role,
      });

      const payload = { sub: user.id, username, email, role };
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

      const { id, email, role } = user;
      const payload = { sub: id, username, email, role };
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
}
