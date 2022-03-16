import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { admin_username, c_error_codes } from '../constatns';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { describe_with_db, TestContext } from 'src/abstract_spec';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ROLE } from 'src/auth/enums/role.enum';

let controller: UsersController;
let auth_service: AuthService;
let users_service: UsersService;
let app: INestApplication;

describe_with_db(
    'UsersController',
    [AuthModule, UsersModule],
    async ( context: TestContext ) => {
        auth_service = context.module.get<AuthService>( AuthService );
        users_service = context.module.get<UsersService>( UsersService );
        await users_service.add_admin_user();
        controller = context.module.get<UsersController>( UsersController );
        app = context.app;
    },
    () => {
        it( 'controller should be defined', () => {
            expect( controller ).toBeDefined();
        } );

        it( 'GET should be 404 on wrong username', async () => {
            await request( app.getHttpServer() )
                .get( '/users/u1' )
                .set( 'Accept', 'application/json' )
                .expect( 404 )
                .expect( ( res: request.Response ) => {
                    expect( res.body.code ).toEqual( c_error_codes.not_found );
                } );
        } );

        it( 'should return same user', async () => {
            await auth_service.register( {
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

        it( 'should work properly with roles guard', async () => {
            const token = await auth_service.register( {
                username: 'u1',
                password_hash: 'p1',
            } );

            await request( app.getHttpServer() )
                .post( '/users/u1/roles' )
                .set( 'Authorization', `Bearer ${token.access_token}` )
                .send( { roles: [ROLE.USER, ROLE.ADMIN] } )
                .expect( 403 );
        } );

        it( 'sset roles should be 404 for none existant user', async () => {
            const admin_token = ( await auth_service.login( await users_service.get_user_by_username( admin_username ) ) ).access_token;

            await request( app.getHttpServer() )
                .post( '/users/u1/roles' )
                .set( 'Authorization', `Bearer ${admin_token}` )
                .send( { roles: [ROLE.USER, ROLE.ADMIN] } )
                .expect( 404 );
        } );

        it( 'should return set roles properly', async () => {
            await auth_service.register( {
                username: 'u1',
                password_hash: 'p1',
            } );

            const admin_token = ( await auth_service.login( await users_service.get_user_by_username( admin_username ) ) ).access_token;

            let user = await users_service.get_user_by_username( 'u1' );
            expect( user.roles ).toEqual( [ROLE.USER] );

            await request( app.getHttpServer() )
                .post( '/users/u1/roles' )
                .set( 'Authorization', `Bearer ${admin_token}` )
                .send( { roles: [ROLE.USER, ROLE.ADMIN] } )
                .expect( 201 )
                .expect( ( res: request.Response ) => {
                    expect( res.body.username ).toEqual( 'u1' );
                    expect( res.body.roles ).toEqual( [ROLE.USER, ROLE.ADMIN] );
                } );

            user = await users_service.get_user_by_username( 'u1' );
            expect( user.roles ).toEqual( [ROLE.USER, ROLE.ADMIN] );

            await request( app.getHttpServer() )
                .post( '/users/u1/roles' )
                .set( 'Authorization', `Bearer ${admin_token}` )
                .send( { roles: [] } )
                .expect( 201 )
                .expect( ( res: request.Response ) => {
                    expect( res.body.username ).toEqual( 'u1' );
                    expect( res.body.roles ).toEqual( [] );
                } );

            user = await users_service.get_user_by_username( 'u1' );
            expect( user.roles ).toEqual( [] );
        } );
    } );
