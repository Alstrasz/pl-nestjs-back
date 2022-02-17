import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
    @Prop( { required: true, unique: true } )
        username: string;

    @Prop( { required: true } )
        password_hash: string;

    @Prop( { required: true } )
        registration_date_in_seconds: number;

    @Prop( { required: true, type: [{ post_id: mongoose.Schema.Types.ObjectId, is_positive: Boolean }] } )
        ratings: { post_id: mongoose.Schema.Types.ObjectId, is_positive: boolean }[];
}

export const CatSchema = SchemaFactory.createForClass( User );
