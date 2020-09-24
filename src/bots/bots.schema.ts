import * as mongoose from 'mongoose';
import { v4 } from 'uuid';

export const BotSchema = new mongoose.Schema({
  _id: { type: String, default: v4 },
  owner: String,
  validTo: Date,
  server: String,
});
