import { Exclude, Expose } from 'class-transformer';
import { ROLE } from 'src/auth/enums/role.enum';

@Exclude()
export class UserDto {
    @Expose()
        uuid: string;

    @Expose()
        username: string;

    password_hash: string;

    @Expose()
        registration_date_in_seconds: number;

    post_votes: Map<string, boolean>;

    @Expose()
        roles: ROLE[];

    constructor ( partial: Partial<UserDto> ) {
        Object.assign( this, partial );
    }
}
