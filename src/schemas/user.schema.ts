import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
    @Prop( { required: true, unique: true } )
        uuid: string;

    @Prop( { required: true, unique: true } )
        username: string;

    @Prop( { required: true } )
        password_hash: string;

    @Prop( { required: true } )
        registration_date_in_seconds: number;

    @Prop( { required: true, default: {}, type: { String: Boolean } } )
        post_votes: { [post_id: number]: boolean };
}

export const UserSchema = SchemaFactory.createForClass( User );
