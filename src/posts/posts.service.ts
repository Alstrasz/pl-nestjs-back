import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from 'src/schemas/post.schema';
import { Model } from 'mongoose';
import { CreatePostDto } from './dto/create_post.dto';
import { c_error_codes } from 'src/constatns';


@Injectable()
export class PostsService {
    constructor ( @InjectModel( Post.name ) private post_model: Model<PostDocument> ) {}

    async create ( create_post_dto: CreatePostDto, author: string ): Promise<Post> {
        if ( author == null || author == undefined || author == '' ) {
            throw new UnauthorizedException( {
                code: c_error_codes.field_is_null,
                fields: { author: author },
                description: 'Cannot create post without author',
            } );
        }
        const created_post = new this.post_model( {
            id: 1,
            author: author,
            title: create_post_dto.title,
            text: create_post_dto.text,
            date_in_seconds: ( new Date() ).getSeconds(),
            rating: [],
        } );
        return created_post.save();
    }

    async get_post_by_id ( id: string ): Promise<Post> {
        return await this.post_model.findOne( { id: id } );
    }
}
