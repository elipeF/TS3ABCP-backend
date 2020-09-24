import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { debug } from 'console';
import { PassportLocalModel } from 'mongoose';
import { IUser } from './user.interface';
import { User } from 'src/user';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private userModel: PassportLocalModel<IUser>,
  ) {}
  async findAll(): Promise<IUser[]> {
    return await this.userModel.find().exec();
  }
  async findOne(options: object): Promise<IUser> {
    return await this.userModel.findOne(options).exec();
  }

  async findById(ID: string): Promise<IUser> {
    return await this.userModel.findById(ID).exec();
  }
  async create(createUserDto: User): Promise<IUser> {
    const createdUser = new this.userModel(createUserDto);
    return await createdUser.save();
  }

  async setPassword(id, userObj: User): Promise<any> {
    const user = await this.findById(id);
    return await user.setPassword(userObj.password);
  }

  async update(ID: string, newValue: IUser): Promise<IUser> {
    const user = await this.userModel.findById(ID).exec();

    if (!user._id) {
      debug('user not found');
    }

    await this.userModel.findByIdAndUpdate(ID, newValue).exec();
    return await this.userModel.findById(ID).exec();
  }
  async delete(ID: string): Promise<string> {
    try {
      await this.userModel.findByIdAndRemove(ID).exec();
      return 'The user has been deleted';
    } catch (err) {
      debug(err);
      return 'The user could not be deleted';
    }
  }
}
