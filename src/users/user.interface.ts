import { PassportLocalDocument } from 'mongoose';

export interface IUser extends PassportLocalDocument {
  readonly admin: boolean;
  readonly name: string;
  readonly username: string;
  readonly password: string;
}
