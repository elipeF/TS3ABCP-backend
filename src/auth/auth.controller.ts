import {
  Controller,
  HttpStatus,
  Post,
  Body,
  HttpException,
  Get,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/user';
import { UsersService } from 'src/users/users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) { }

  @Post('register')
  public async register(@Body() createUserDto: User) {
    return await this.authService.register(createUserDto);
  }
  @UseGuards(AuthGuard('local'))
  @Post('login')
  public async login(@Body() login: User) {
    const response = await this.usersService.findOne({ username: login.name });
    if (!response) {
      throw new HttpException(
        {
          message: 'User Not Found',
        },
        HttpStatus.NOT_FOUND,
      );
    } else {
      return this.authService.createToken(response);
    }
  }
}
