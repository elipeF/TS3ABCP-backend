import { IsUUID } from 'class-validator';

export class HasUuid {
  @IsUUID(4) readonly id: string;
}
