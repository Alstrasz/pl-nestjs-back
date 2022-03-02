import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from 'src/schemas/post.schema';
import { Model } from 'mongoose';
import { CreatePostDto } from './dto/create_post.dto';
import { counter_name, c_error_codes } from 'src/constatns';
import { Counter, CounterDocument } from 'src/schemas/counter.schema';
import mongoose from 'mongoose';


@Injectable()
export class PostsService {
    constructor (
        @InjectModel( Post.name ) private post_model: Model<PostDocument>,
        @InjectModel( Counter.name ) private counter_model: Model<CounterDocument>,
        @InjectConnection() private connection: mongoose.Connection,
    ) {}

    async create ( create_post_dto: CreatePostDto, author: string ): Promise<Post> {
        if ( author == null || author == undefined || author == '' ) {
            throw new UnauthorizedException( {
                code: c_error_codes.field_is_null,
                fields: { author: author },
                description: 'Cannot create post without author',
            } );
        }
        const session = await this.connection.startSession();
        let post;
        await session.withTransaction( async () => {
            const id = await this.counter_model.findOneAndUpdate( { name: counter_name.post }, { $inc: { count: 1 } }, { upsert: true } );
            const created_post = new this.post_model( {
                id: id.count,
                author: author,
                title: create_post_dto.title,
                text: create_post_dto.text,
                date_in_seconds: ( new Date() ).getSeconds(),
                rating: [],
            } );
            post = await created_post.save();
        }, { readConcern: { level: 'local' }, writeConcern: { w: 'majority' } } )
            .finally( () => {
                session.endSession();
            } );
        return post;
    }

    async get_post_by_id ( id: string ): Promise<Post> {
        return await this.post_model.findOne( { id: id } );
    }
}
