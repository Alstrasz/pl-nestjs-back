import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module( {
    imports: [
        AuthModule,
        UsersModule,
        MongooseModule.forRootAsync( {
            imports: [ConfigModule],
            useFactory: async ( configService: ConfigService ) => ( {
                uri: configService.get<string>( 'MONGODB_URI' ),
            } ),
            inject: [ConfigService],
        } ),
        PostsModule,
    ],
    controllers: [AppController],
    providers: [AppService],
} )
export class AppModule {}
