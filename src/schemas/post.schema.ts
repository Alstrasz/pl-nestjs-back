import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PostDocument = Post & Document;

@Schema()
export class Post {
    @Prop( { required: true, unique: true } )
        id: number;

    @Prop( { required: true, index: true } )
        author: string;

    @Prop( { required: true } )
        title: string;

    @Prop( { required: true, minlength: 1 } )
        text: string;

    @Prop( { required: true } )
        date_in_seconds: number;

    @Prop( { required: true, default: 0 } )
        votes: number;
}

export const PostSchema = SchemaFactory.createForClass( Post );
