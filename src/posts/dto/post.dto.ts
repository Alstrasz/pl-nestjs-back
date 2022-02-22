import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class PostDto {
    @Expose()
        id: number;

    @Expose()
        author: string;

    @Expose()
        title: string;

    @Expose()
        text: string;

    @Expose()
        date_in_seconds: number;

    @Expose()
        rating: { user: string, is_positive: boolean }[];

    constructor ( partial: Partial<PostDto> ) {
        Object.assign( this, partial );
    }
}
