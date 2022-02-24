import { Body, Controller, Post, UsePipes, ValidationPipe, Request, Param, Get, UseGuards, NotFoundException } from '@nestjs/common';
import { JwtAuthLoosyGuard } from 'src/auth/jwt-auth-loosy.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { c_error_codes } from 'src/constatns';
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

    @UseGuards( JwtAuthLoosyGuard )
    @Get( ':id' )
    async register ( @Param( 'id' ) id: string, @Request() req ): Promise<PostDto> {
        const post = await this.posts_service.get_post_by_id( id );
        if ( post == null ) {
            throw new NotFoundException( {
                fields: { id: id },
                description: 'No post with such index found',
                code: c_error_codes.not_found,
            } );
        }
        return new PostDto( {
            author: post.author,
            title: post.title,
            text: post.text,
            date_in_seconds: post.date_in_seconds,
            votes: post.votes,
            user_upvoted: req.user?.[post.id],
        } );
    }
}
