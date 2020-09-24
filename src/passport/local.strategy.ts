import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Model, PassportLocalModel } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from 'src/users/user.interface';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    @InjectModel('User') private readonly userModel: PassportLocalModel<IUser>,
  ) {
    super(
      {
        usernameField: 'name',
        passwordField: 'password',
      },
      userModel.authenticate(),
    );
  }
}
