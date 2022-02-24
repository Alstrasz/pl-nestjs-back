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
        votes: number;

    @Expose()
        user_upvoted?: boolean;

    constructor ( partial: Partial<PostDto> ) {
        Object.assign( this, partial );
    }
}
