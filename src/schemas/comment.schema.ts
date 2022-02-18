import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema()
export class Comment {
    @Prop( { required: true, index: true } )
        author: string;

    @Prop( { required: true, index: true } )
        post_id: number;

    @Prop( { sparse: true } )
        parent_id: number | null;

    @Prop( { required: true, minlength: 1 } )
        text: string;

    @Prop( { required: true } )
        date_in_seconds: number;

    @Prop( { required: true, type: [{ user: String, is_positive: Boolean }] } )
        rating: { user: string, is_positive: boolean }[];
}

export const CommentSchema = SchemaFactory.createForClass( Comment );
