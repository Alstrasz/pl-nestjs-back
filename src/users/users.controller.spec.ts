import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { c_error_codes } from '../constatns';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { describe_with_db, TestContext } from 'src/abstract_spec';
import { UsersController } from './users.controller';

let controller: UsersController;
let auth: AuthService;
let app: INestApplication;

describe_with_db(
    'UsersController',
    [AuthModule, UsersModule],
    ( context: TestContext ) => {
        auth = context.module.get<AuthService>( AuthService );
        controller = context.module.get<UsersController>( UsersController );
        app = context.app;
    },
    () => {
        it( 'controller should be defined', () => {
            expect( controller ).toBeDefined();
        } );

        it( 'GET should be 404 on wrong id', async () => {
            await request( app.getHttpServer() )
                .get( '/users/u1' )
                .set( 'Accept', 'application/json' )
                .expect( 404 )
                .expect( ( res: request.Response ) => {
                    expect( res.body.code ).toEqual( c_error_codes.not_found );
                } );
        } );

        it( 'should return same post', async () => {
            await auth.register( {
                username: 'u1',
                password_hash: 'p1',
            } );
            await request( app.getHttpServer() )
                .get( '/users/u1' )
                .expect( 200 )
                .expect( ( res: request.Response ) => {
                    expect( res.body.username ).toEqual( 'u1' );
                } );
        } );
    } );
