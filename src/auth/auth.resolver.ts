import { AuthService } from './auth.service';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { CreateUserInput } from '../user/dto/create-user.input';
import { LoginInput } from './dto/login.input';
import { AuthReturn } from './auth.utils';

@Resolver(() => AuthReturn)
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Query(() => AuthReturn, { name: 'signUp' })
  singUp(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.authService.signUp(createUserInput);
  }

  @Query(() => AuthReturn, { name: 'login' })
  login(@Args('loginInput') loginInput: LoginInput) {
    return this.authService.login(loginInput);
  }
}
