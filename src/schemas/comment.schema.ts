import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema()
export class Comment {
    @Prop( { required: true, unique: true, type: mongoose.Schema.Types.ObjectId } )
        _id: mongoose.Schema.Types.ObjectId;

    @Prop( { required: true, index: true } )
        author: string;

    @Prop( { required: true, index: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' } )
        post_id: string;

    @Prop( { sparse: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' } )
        parent_id: mongoose.Schema.Types.ObjectId | null;

    @Prop( { required: true, minlength: 1 } )
        text: string;

    @Prop( { required: true } )
        date_in_seconds: number;

    @Prop( { required: true, type: [{ user: String, is_positive: Boolean }] } )
        rating: { user: string, is_positive: boolean }[];
}

export const CatSchema = SchemaFactory.createForClass( Comment );
