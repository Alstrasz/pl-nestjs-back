import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from 'src/schemas/post.schema';
import { Model } from 'mongoose';
import { CreatePostDto } from './dto/create_post.dto';
import { counter_name, c_error_codes } from 'src/constatns';
import { Counter, CounterDocument } from 'src/schemas/counter.schema';
import mongoose from 'mongoose';
import { UsersService } from 'src/users/users.service';


@Injectable()
export class PostsService {
    constructor (
        private users_service: UsersService,
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
            const id = await this.counter_model.findOneAndUpdate( { name: counter_name.post }, { $inc: { count: 1 } }, { upsert: true, returnOriginal: false, session } );
            const created_post = new this.post_model( {
                id: id.count,
                author: author,
                title: create_post_dto.title,
                text: create_post_dto.text,
                date_in_seconds: ( new Date() ).getSeconds(),
                rating: [],
            } );
            post = await created_post.save( { session } );
        }, { readConcern: { level: 'local' }, writeConcern: { w: 'majority' } } )
            .finally( () => {
                session.endSession();
            } );
        return post;
    }

    async get_post_by_id ( id: number ): Promise<Post> {
        return await this.post_model.findOne( { id: id } );
    }

    async set_vote_by_id ( post_id: number, username: string, new_vote: boolean | undefined ) {
        if ( username == undefined ) {
            throw new UnauthorizedException( {
                code: c_error_codes.field_is_null,
                fields: { username: username },
                description: 'Cannot vote post without auth',
            } );
        }
        const session = await this.connection.startSession();
        let post;
        await session.withTransaction( async () => {
            const vote = await this.users_service.set_vote_for_post_id( username, post_id, new_vote, session );
            let delta = 0;
            if ( vote === undefined ) {
                if ( new_vote === undefined ) {
                    delta = 0;
                } else if ( new_vote ) {
                    delta = 1;
                } else if ( !new_vote ) {
                    delta = -1;
                }
            } else if ( vote ) {
                if ( new_vote === undefined ) {
                    delta = -1;
                } else if ( new_vote ) {
                    delta = 0;
                } else if ( !new_vote ) {
                    delta = -2;
                }
            } else if ( !vote ) {
                if ( new_vote === undefined ) {
                    delta = +1;
                } else if ( new_vote ) {
                    delta = +2;
                } else if ( !new_vote ) {
                    delta = 0;
                }
            }
            post = await this.post_model.findOneAndUpdate( { id: post_id }, { $inc: { votes: delta } }, { returnOriginal: false, session } );
            if ( post == null ) {
                throw new NotFoundException( {
                    fields: { id: post_id },
                    description: 'No post with such index found',
                    code: c_error_codes.not_found,
                } );
            }
        }, { readConcern: { level: 'local' }, writeConcern: { w: 'majority' } } )
            .finally( () => {
                session.endSession();
            } );
        return post;
    }
}
