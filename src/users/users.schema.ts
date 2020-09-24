import * as mongoose from 'mongoose';
import * as passportLocalMongoose from 'passport-local-mongoose';
import { v4 } from 'uuid';

export const UserSchema = new mongoose.Schema({
  _id: { type: String, default: v4 },
  username: { type: String, unique: true, required: true },
  admin: { type: Boolean, default: false },
  password: String,
});
UserSchema.plugin(passportLocalMongoose);
