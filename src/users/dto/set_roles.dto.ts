import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { ROLE } from 'src/auth/enums/role.enum';

export class SetRolesDto {
    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ValidateNested( { each: true } )
    @Type( () => String )
        roles: Array<ROLE>;
}
