import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsNumber,
  IsIn,
  IsUUID,
} from 'class-validator';

export class BotSettings {
  @IsOptional()
  @IsIn(['en', 'pl', 'cs', 'da', 'fr', 'de', 'hu', 'ru', 'es', 'es-ar', 'th'])
  readonly language;
  @IsOptional() @IsString() @MinLength(3) @MaxLength(30) readonly name;
  @IsOptional() @IsNumber() readonly channel;
  @IsOptional() readonly address;
  @IsOptional() @IsNumber() readonly count;
  @IsOptional() @IsUUID() readonly owner;
}
