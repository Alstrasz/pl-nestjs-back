import { ClassSerializerInterceptor, INestApplication } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export function apply_middleware ( app: INestApplication ) {
    app.useGlobalInterceptors( new ClassSerializerInterceptor( app.get( Reflector ) ) );
}

export function setup_swagger ( app: INestApplication ) {
    const config = new DocumentBuilder()
        .setTitle( 'pl-nestjs-back' )
        .setDescription( 'Api descciption of pl-nestjs-back, project build to learn features of nestjs' )
        .setVersion( '0.1' )
        .addTag( 'App' )
        .addBearerAuth( {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT token issued when logged in \ registered',
        } )
        .build();
    const document = SwaggerModule.createDocument( app, config );
    SwaggerModule.setup( 'api', app, document );
}

async function bootstrap () {
    const app = await NestFactory.create( AppModule );
    apply_middleware( app );
    setup_swagger( app );
    await app.listen( 8080 );
}
bootstrap();
