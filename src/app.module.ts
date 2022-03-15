import { MiddlewareConsumer, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerMiddleware } from './logger.middleware';

@Module( {
    imports: [
        AuthModule,
        UsersModule,
        MongooseModule.forRootAsync( {
            imports: [ConfigModule],
            useFactory: async ( ) => ( {
                uri: process.env.MONGO_URI || 'mongodb://127.0.0.1:8087?replicaSet=rs',
            } ),
            inject: [ConfigService],
        } ),
        PostsModule,
    ],
    controllers: [AppController],
    providers: [AppService],
} )
export class AppModule {
    configure ( consumer: MiddlewareConsumer ) {
        consumer
            .apply( LoggerMiddleware )
            .forRoutes( '*' );
    }
}
