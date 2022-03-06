/* eslint-disable @typescript-eslint/no-unused-vars */
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { apply_middleware } from './main';

export interface TestContext {
    module: TestingModule,
    app: INestApplication
}

export function describe_with_db ( name: string, imports: Array<any>, extra_before_all: ( context: TestContext ) => void, cases: () => void ) {
    describe( name, () => {
        let app: INestApplication;
        let connection: mongoose.Connection;
        let module: TestingModule;

        beforeAll( async () => {
            const new_imports = [MongooseModule.forRoot( `mongodb://localhost:8088/${name}?replicaSet=rs` )];
            for ( const imp of imports ) {
                new_imports.push( imp );
            }
            module = await Test.createTestingModule( {
                imports: new_imports,
            } ).compile();


            app = module.createNestApplication();
            apply_middleware( app );
            app.listen( 0 );
            connection = module.get( getConnectionToken() );
            // eslint-disable-next-line guard-for-in
            for ( const prop in connection.collections ) {
                connection.collections[prop].deleteMany( {} );
            }
            extra_before_all( { module, app } );
        } );

        afterEach( async () => {
            // eslint-disable-next-line guard-for-in
            for ( const prop in connection.collections ) {
                await connection.collections[prop].deleteMany( {} );
            }
        } );

        it( 'app shoukd be defined', () => {
            expect( app ).toBeDefined();
        } );

        cases();
    } );
}
