import { IsUUID } from 'class-validator';

export class uuidArray {
  @IsUUID(4, { each: true }) readonly ids: string[];
}
