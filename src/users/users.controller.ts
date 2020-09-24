import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/guards/admin.guard';
import { User } from 'src/user';
import { HasUuid } from 'src/has-uuid';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('/')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async getAll() {
    return this.userService.findAll();
  }

  @Get('/:id/password')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async changePassword(@Body() user: User, @Param() params: HasUuid) {
    return this.userService.setPassword(params.id, user);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async delete(@Param() params: HasUuid) {
    return this.userService.delete(params.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
