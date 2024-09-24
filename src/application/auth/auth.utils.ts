import { Field, ObjectType } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

export const hashPassword = async (password: string) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string,
) => {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};

export const verifyAndDecodeToken = async (
  token: string,
  jwtService: JwtService,
): Promise<any> => {
  try {
    const decoded = await jwtService.verifyAsync(token);
    return decoded;
  } catch (error) {
    throw new Error(`Invalid token: ${error.message}\n${error.stack}`);
  }
};

@ObjectType()
export class AuthReturn {
  @Field(() => String)
  declare access_token: string;
}
