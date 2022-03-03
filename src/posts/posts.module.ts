import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Counter, CounterSchema } from 'src/schemas/counter.schema';
import { Post, PostSchema } from 'src/schemas/post.schema';
import { UsersModule } from 'src/users/users.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module( {
    imports: [
        UsersModule,
        MongooseModule.forFeature( [{ name: Post.name, schema: PostSchema }, { name: Counter.name, schema: CounterSchema }] ),
    ],
    controllers: [PostsController],
    providers: [PostsService],
} )
export class PostsModule {}
