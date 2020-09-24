import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { IUser } from 'src/users/user.interface';
import { PassportLocalModel } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/user';
import { JwtService } from '@nestjs/jwt';
import { identity } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    @InjectModel('User') private readonly userModel: PassportLocalModel<IUser>,
    private jwtService: JwtService,
  ) { }
  async register(user: User) {
    try {
      const { id, username } = await this.userModel.register(
        new this.userModel({
          username: user.name,
        }),
        user.password,
      );
      return { id, username };
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  createToken(user) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      expire_in: process.env.JWT_EXPIRE,
    };
  }

  async validateUser(payload): Promise<any> {
    const { _id, username, admin } = await this.usersService.findById(
      payload.sub,
    );
    return { id: _id, name: username, admin };
  }
}
