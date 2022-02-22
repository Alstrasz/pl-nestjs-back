import { Body, Controller, Post, UsePipes, ValidationPipe, Request, Param, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreatePostDto } from './dto/create_post.dto';
import { PostDto } from './dto/post.dto';
import { PostsService } from './posts.service';

@Controller( 'posts' )
export class PostsController {
    constructor ( private posts_service: PostsService ) {}

    @UseGuards( JwtAuthGuard )
    @UsePipes( new ValidationPipe( { whitelist: true } ) )
    @Post( 'create' )
    async create ( @Request() req, @Body() create_post_dto: CreatePostDto ): Promise<PostDto> {
        const t = await this.posts_service.create( create_post_dto, req.user?.username );
        console.log( t );
        return new PostDto( t );
    }

    @Get( ':id' )
    async register ( @Param( 'id' ) id: string ): Promise<PostDto> {
        return await this.posts_service.get_post_by_id( id );
    }
}
