import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { describe_with_db, TestContext } from 'src/abstract_spec';
import { AuthController } from './auth.controller';
import { AuthModule } from './auth.module';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';


let auth_controller: AuthController;
let auth_service: AuthService;
let app: INestApplication;

describe_with_db(
    'AuthController',
    [AuthModule, UsersModule],
    ( context: TestContext ) => {
        app = context.app;
        auth_controller = context.module.get<AuthController>( AuthController );
        auth_service = context.module.get<AuthService>( AuthService );
    },
    () => {
        it( 'should be defined', () => {
            expect( auth_controller ).toBeDefined();
        } );

        it( 'login should return 401 for nonexistant user', async () => {
            await request( app.getHttpServer() )
                .post( '/auth/login' )
                .set( 'Accept', 'application/json' )
                .send( {
                    username: 'u1',
                    password_hash: 'p1',
                } )
                .expect( 401 );
        } );

        it( 'login should return 401 for wrong password', async () => {
            await auth_service.register( {
                username: 'u1',
                password_hash: 'p1',
            } );

            await request( app.getHttpServer() )
                .post( '/auth/login' )
                .set( 'Accept', 'application/json' )
                .send( {
                    username: 'u1',
                    password_hash: 'p2',
                } )
                .expect( 401 );
        } );

        it( 'should login properly', async () => {
            await auth_service.register( {
                username: 'u1',
                password_hash: 'p1',
            } );

            await request( app.getHttpServer() )
                .post( '/auth/login' )
                .set( 'Accept', 'application/json' )
                .send( {
                    username: 'u1',
                    password_hash: 'p1',
                } )
                .expect( 201 )
                .expect( ( res: request.Response ) => {
                    expect( res.body.access_token ).toBeDefined();
                } );
        } );

        it( 'should register properly', async () => {
            await request( app.getHttpServer() )
                .post( '/auth/register' )
                .set( 'Accept', 'application/json' )
                .send( {
                    username: 'u1',
                    password_hash: 'p1',
                } )
                .expect( 201 )
                .expect( ( res: request.Response ) => {
                    expect( res.body.access_token ).toBeDefined();
                } );
        } );

        it( 'should not register with same username twice', async () => {
            await auth_service.register( {
                username: 'u1',
                password_hash: 'p1',
            } );

            await request( app.getHttpServer() )
                .post( '/auth/register' )
                .set( 'Accept', 'application/json' )
                .send( {
                    username: 'u1',
                    password_hash: 'p2',
                } )
                .expect( 409 );
        } );

        it( 'should get profile properly', async () => {
            const token = await auth_service.register( {
                username: 'u1',
                password_hash: 'p1',
            } );

            await request( app.getHttpServer() )
                .get( '/auth/profile' )
                .set( 'Accept', 'application/json' )
                .set( 'Authorization', `Bearer ${token.access_token}` )
                .expect( 200 )
                .expect( ( res: request.Response ) => {
                    expect( res.body.username ).toEqual( 'u1' );
                } );
        } );

        it( 'profile should return 401 without token', async () => {
            await auth_service.register( {
                username: 'u1',
                password_hash: 'p1',
            } );

            await request( app.getHttpServer() )
                .get( '/auth/profile' )
                .set( 'Accept', 'application/json' )
                .expect( 401 );
        } );
    },
);
