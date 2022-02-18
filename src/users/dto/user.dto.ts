import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserDto {
    @Expose()
        uuid: string;

    @Expose()
        username: string;

    password_hash: string;

    @Expose()
        registration_date_in_seconds: number;
    @Expose()
        ratings: { post_id: number, is_positive: boolean }[];

    constructor ( partial: Partial<UserDto> ) {
        Object.assign( this, partial );
    }
}
