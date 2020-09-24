import { Document } from 'mongoose';

export interface IBot extends Document {
  readonly owner: string;
  readonly server: string;
}
