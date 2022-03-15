import { Expose } from 'class-transformer';

@Expose()
export class PostDto {
    id: number;

    author: string;

    title: string;

    text: string;

    date_in_seconds: number;

    votes: number;

    user_upvoted?: boolean;

    constructor ( partial: Partial<PostDto> ) {
        Object.assign( this, partial );
    }
}
