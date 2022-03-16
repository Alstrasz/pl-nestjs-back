import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class PostDto {
    @Expose()
    @ApiProperty()
        id: number;

    @Expose()
    @ApiProperty()
        author: string;

    @Expose()
    @ApiProperty()
        title: string;

    @Expose()
    @ApiProperty()
        text: string;

    @Expose()
    @ApiProperty()
        date_in_seconds: number;

    @Expose()
    @ApiProperty()
        votes: number;

    @Expose()
    @ApiProperty()
        user_upvoted?: boolean;

    constructor ( partial: Partial<PostDto> ) {
        Object.assign( this, partial );
    }
}
