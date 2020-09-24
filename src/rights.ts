import {
    IsOptional,
    IsString,
    IsNumber,
    IsIn,
} from 'class-validator';

export class Rights {
    @IsIn(['user', 'admin'])
    readonly type;
    @IsOptional() @IsString() readonly useruid;
    @IsOptional() @IsNumber() readonly groupid;
}
