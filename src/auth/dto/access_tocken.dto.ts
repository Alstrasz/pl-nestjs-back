import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AccessTokenDto {
    @Expose()
        access_token: string;

    constructor ( partial: Partial<AccessTokenDto> ) {
        Object.assign( this, partial );
    }
}
