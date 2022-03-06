import { ClassSerializerInterceptor, INestApplication } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';

export function apply_middleware ( app: INestApplication ) {
    app.useGlobalInterceptors( new ClassSerializerInterceptor( app.get( Reflector ) ) );
}

async function bootstrap () {
    const app = await NestFactory.create( AppModule );
    apply_middleware( app );
    await app.listen( 8080 );
}
bootstrap();
