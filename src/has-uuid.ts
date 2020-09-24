import { IsUUID } from 'class-validator';

export class HasUuid {
  @IsUUID() readonly id: string;
}
