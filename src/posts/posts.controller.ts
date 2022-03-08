import { Body, Controller, Post, UsePipes, ValidationPipe, Request, Param, Get, UseGuards, NotFoundException, ParseIntPipe, Query, BadRequestException } from '@nestjs/common';
import { JwtAuthLoosyGuard } from 'src/auth/jwt-auth-loosy.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { c_error_codes } from 'src/constatns';
import { PostDocument } from 'src/schemas/post.schema';
import { CreatePostDto } from './dto/create_post.dto';
import { PostDto } from './dto/post.dto';
import { VotePostDto } from './dto/vote_post.dto';
import { PostsService } from './posts.service';

@Controller( 'posts' )
export class PostsController {
    constructor ( private posts_service: PostsService ) {}

    @UseGuards( JwtAuthGuard )
    @UsePipes( new ValidationPipe( { whitelist: true } ) )
    @Post( 'create' )
    async create ( @Request() req, @Body() create_post_dto: CreatePostDto ): Promise<PostDto> {
        const post = await this.posts_service.create( create_post_dto, req.user?.username );
        return new PostDto( {
            id: post.id,
            author: post.author,
            title: post.title,
            text: post.text,
            date_in_seconds: post.date_in_seconds,
            votes: post.votes,
            user_upvoted: req.user?.post_votes.get( `${post.id}` ),
        } );
    }

    @UseGuards( JwtAuthGuard )
    @UsePipes( new ValidationPipe( { whitelist: true } ) )
    @Post( ':id/vote' )
    async vote ( @Request() req, @Body() vote_post_dto: VotePostDto, @Param( 'id', ParseIntPipe ) id: number ): Promise<void> {
        await this.posts_service.set_vote_by_id( id, req.user.username, vote_post_dto.vote );
    }

    @UseGuards( JwtAuthLoosyGuard )
    @Get( 'all' )
    async all_by_author ( @Request() req, @Query( 'author' ) author: string, @Query( 'date' ) date: string ): Promise<{ posts: Array<PostDto> }> {
        let query: Array<PostDocument>;
        if ( !author && !date ) {
            query = await this.posts_service.get_posts_earlier_then( 100 );
        } else if ( author && date ) {
            throw new BadRequestException( {
                description: 'author and date at the same time not supported yet',
                code: c_error_codes.bad_query,
            } );
        } else if ( author ) {
            query = await this.posts_service.get_post_by_author( author );
        } else if ( date ) {
            if ( ! /^\d+$/.test( date ) ) {
                throw new NotFoundException( {
                    fields: { date: date },
                    description: 'Only positive integers are allowed',
                    code: c_error_codes.not_found,
                } );
            }
            query = await this.posts_service.get_posts_earlier_then( 100, parseInt( date ) );
        }


        const ret = [];
        query.forEach( ( post ) => {
            ret.push( new PostDto( {
                id: post.id,
                author: post.author,
                title: post.title,
                text: post.text,
                date_in_seconds: post.date_in_seconds,
                votes: post.votes,
                user_upvoted: req.user?.post_votes.get( `${post.id}` ),
            } ) );
        } );
        return { posts: ret };
    }

    @UseGuards( JwtAuthLoosyGuard )
    @Get( ':id' )
    async get_by_id ( @Param( 'id', ParseIntPipe ) id: number, @Request() req ): Promise<PostDto> {
        const post = await this.posts_service.get_post_by_id( id );
        if ( !post ) {
            throw new NotFoundException( {
                fields: { id: id },
                description: 'No post with such index found',
                code: c_error_codes.not_found,
            } );
        }
        return new PostDto( {
            id: post.id,
            author: post.author,
            title: post.title,
            text: post.text,
            date_in_seconds: post.date_in_seconds,
            votes: post.votes,
            user_upvoted: req.user?.post_votes.get( `${post.id}` ),
        } );
    }
}
