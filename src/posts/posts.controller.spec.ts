import { INestApplication } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsModule } from './posts.module';
import * as request from 'supertest';
import { c_error_codes } from '../constatns';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { describe_with_db, TestContext } from 'src/abstract_spec';
import { PostsService } from './posts.service';
import { sleep } from 'src/helpers';

let controller: PostsController;
let auth: AuthService;
let posts_service: PostsService;
let app: INestApplication;

describe_with_db(
    'PostsController',
    [PostsModule, AuthModule, UsersModule],
    async ( context: TestContext ) => {
        auth = context.module.get<AuthService>( AuthService );
        controller = context.module.get<PostsController>( PostsController );
        posts_service = context.module.get<PostsService>( PostsService );
        app = context.app;
    },
    () => {
        it( 'controller should be defined', () => {
            expect( controller ).toBeDefined();
        } );

        it( 'GET should be 404 on wrong id', async () => {
            await request( app.getHttpServer() )
                .get( '/posts/1' )
                .set( 'Accept', 'application/json' )
                .expect( 404 )
                .expect( ( res: request.Response ) => {
                    expect( res.body.code ).toEqual( c_error_codes.not_found );
                } );
        } );

        it( 'should give 201 for creating post', async () => {
            const token1 = await auth.register( {
                username: 'u1',
                password_hash: 'p1',
            } );
            await request( app.getHttpServer() )
                .post( '/posts/create' )
                .set( 'Authorization', `Bearer ${token1.access_token}` )
                .send( {
                    title: 't1',
                    text: 'txt1',
                } )
                .expect( 201 )
                .expect( ( res: request.Response ) => {
                    expect( res.body.id ).toEqual( 1 );
                    expect( res.body.title ).toEqual( 't1' );
                    expect( res.body.text ).toEqual( 'txt1' );
                    expect( res.body.author ).toEqual( 'u1' );
                    expect( res.body.votes ).toEqual( 0 );
                } );
        } );

        it( 'should return same post', async () => {
            const token1 = await auth.register( {
                username: 'u1',
                password_hash: 'p1',
            } );
            await request( app.getHttpServer() )
                .post( '/posts/create' )
                .set( 'Authorization', `Bearer ${token1.access_token}` )
                .send( {
                    title: 't1',
                    text: 'txt1',
                } )
                .expect( 201 );

            await request( app.getHttpServer() )
                .get( '/posts/1' )
                .set( 'Accept', 'application/json' )
                .expect( 200 )
                .expect( ( res: request.Response ) => {
                    expect( res.body.id ).toEqual( 1 );
                    expect( res.body.title ).toEqual( 't1' );
                    expect( res.body.text ).toEqual( 'txt1' );
                    expect( res.body.author ).toEqual( 'u1' );
                    expect( res.body.votes ).toEqual( 0 );
                } );
        } );

        it( 'should set proper id for posts', async () => {
            const token1 = await auth.register( {
                username: 'u1',
                password_hash: 'p1',
            } );
            for ( let i = 1; i <= 16; i++ ) {
                await request( app.getHttpServer() )
                    .post( '/posts/create' )
                    .set( 'Authorization', `Bearer ${token1.access_token}` )
                    .send( {
                        title: 't1',
                        text: 'txt1',
                    } )
                    .expect( 201 )
                    .expect( ( res: request.Response ) => {
                        expect( res.body.id ).toEqual( i );
                    } );
            }
        } );

        it( 'should upvote properly', async () => {
            const token1 = await auth.register( {
                username: 'u1',
                password_hash: 'p1',
            } );

            await posts_service.create( {
                title: 't1',
                text: 'txt1',
            }, 'u1' );

            await request( app.getHttpServer() )
                .post( '/posts/1/vote' )
                .set( 'Authorization', `Bearer ${token1.access_token}` )
                .send( {
                    vote: true,
                } )
                .expect( 201 );

            let post = await posts_service.get_post_by_id( 1 );
            expect( post.votes ).toEqual( 1 );

            await request( app.getHttpServer() )
                .post( '/posts/1/vote' )
                .set( 'Authorization', `Bearer ${token1.access_token}` )
                .send( {
                    vote: false,
                } )
                .expect( 201 );

            post = await posts_service.get_post_by_id( 1 );
            expect( post.votes ).toEqual( -1 );

            await request( app.getHttpServer() )
                .post( '/posts/1/vote' )
                .set( 'Authorization', `Bearer ${token1.access_token}` )
                .send( {
                    vote: undefined,
                } )
                .expect( 201 );

            post = await posts_service.get_post_by_id( 1 );
            expect( post.votes ).toEqual( 0 );
        } );

        it( 'should downvote properly', async () => {
            const token1 = await auth.register( {
                username: 'u1',
                password_hash: 'p1',
            } );

            await posts_service.create( {
                title: 't1',
                text: 'txt1',
            }, 'u1' );

            await request( app.getHttpServer() )
                .post( '/posts/1/vote' )
                .set( 'Authorization', `Bearer ${token1.access_token}` )
                .send( {
                    vote: false,
                } )
                .expect( 201 );

            let post = await posts_service.get_post_by_id( 1 );
            expect( post.votes ).toEqual( -1 );

            await request( app.getHttpServer() )
                .post( '/posts/1/vote' )
                .set( 'Authorization', `Bearer ${token1.access_token}` )
                .send( {
                    vote: true,
                } )
                .expect( 201 );

            post = await posts_service.get_post_by_id( 1 );
            expect( post.votes ).toEqual( 1 );

            await request( app.getHttpServer() )
                .post( '/posts/1/vote' )
                .set( 'Authorization', `Bearer ${token1.access_token}` )
                .send( {
                    vote: undefined,
                } )
                .expect( 201 );

            post = await posts_service.get_post_by_id( 1 );
            expect( post.votes ).toEqual( 0 );
        } );

        it( 'should get by author properly', async () => {
            const token1 = await auth.register( {
                username: 'u1',
                password_hash: 'p1',
            } );

            await posts_service.create( {
                title: 't1',
                text: 'txt1',
            }, 'u1' );

            await posts_service.create( {
                title: 't2',
                text: 'txt2',
            }, 'u1' );

            await request( app.getHttpServer() )
                .get( '/posts/all?author=u1' )
                .set( 'Authorization', `Bearer ${token1.access_token}` )
                .expect( 200 )
                .expect( ( res: request.Response ) => {
                    expect( res.body.posts.length ).toEqual( 2 );
                } );
        } );

        it( 'should get by date properly', async () => {
            const token1 = await auth.register( {
                username: 'u1',
                password_hash: 'p1',
            } );

            await posts_service.create( {
                title: 't1',
                text: 'txt1',
            }, 'u1' );

            sleep( 2000 );

            await posts_service.create( {
                title: 't2',
                text: 'txt2',
            }, 'u1' );

            let date: number;

            await request( app.getHttpServer() )
                .get( '/posts/all' )
                .set( 'Authorization', `Bearer ${token1.access_token}` )
                .expect( 200 )
                .expect( ( res: request.Response ) => {
                    expect( res.body.posts.length ).toEqual( 2 );
                    date = res.body.posts[1].date_in_seconds;
                } );

            await request( app.getHttpServer() )
                .get( `/posts/all?date=${date}` )
                .set( 'Authorization', `Bearer ${token1.access_token}` )
                .expect( 200 )
                .expect( ( res: request.Response ) => {
                    expect( res.body.posts.length ).toEqual( 1 );
                } );
        } );
    } );
