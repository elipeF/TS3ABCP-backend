import { IsString, Matches } from 'class-validator';
export class User {
  @IsString() @Matches(/^\S*$/) readonly name: string;
  @IsString() readonly password: string;
}
