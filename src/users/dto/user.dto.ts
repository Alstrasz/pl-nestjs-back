import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { ROLE } from 'src/auth/enums/role.enum';

@Exclude()
export class UserDto {
    @Expose()
    @ApiProperty()
        uuid: string;

    @Expose()
    @ApiProperty()
        username: string;

    @Expose()
    @ApiProperty()
        registration_date_in_seconds: number;

    @Expose()
    @ApiProperty( { enum: ROLE } )
        roles: ROLE[];

    constructor ( partial: Partial<UserDto> ) {
        Object.assign( this, partial );
    }
}
