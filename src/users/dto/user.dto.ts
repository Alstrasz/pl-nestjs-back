import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ROLE } from 'src/auth/enums/role.enum';

@Expose()
export class UserDto {
    @ApiProperty()
        uuid: string;

    @ApiProperty()
        username: string;

    @ApiProperty()
        registration_date_in_seconds: number;

    @ApiProperty()
        roles: ROLE[];

    constructor ( partial: Partial<UserDto> ) {
        Object.assign( this, partial );
    }
}
