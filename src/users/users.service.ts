import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { Model, Document as Doc } from 'mongoose';
import { CreateUserDto } from 'src/auth/dto/create_user.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
    constructor ( @InjectModel( User.name ) private user_model: Model<UserDocument> ) {}

    async create ( create_user_dto: CreateUserDto ): Promise<User> {
        const created_user = new this.user_model( {
            uuid: uuidv4(),
            username: create_user_dto.username,
            password_hash: create_user_dto.password_hash,
            registration_date_in_seconds: ( new Date() ).getSeconds(),
        } );
        return created_user.save();
    }

    async get_user_by_username ( username: string ): Promise<User> {
        return ( await this.user_model.findOne( { username: username } ) as any )._doc;
    }


    /**
     * Updates user vote for post. Returns old vote
     *
     * @param {string} username
     * @param {number} post_id
     * @param {(bool | undefined)} new_vote
     * @param {*} session
     * @return {*}  {Promise<bool>}
     * @memberof UsersService
     */
    async set_vote_for_post_id (
        username: string,
        post_id: number,
        new_vote: boolean | undefined,
        session: any,
    ): Promise<boolean | undefined> {
        // await this.user_model.findOneAndUpdate( { username: username }, update_query, { session } );
        return await this.user_model.findOne( { username: username }, null, { session } )
            .then( async ( doc ) => {
                const ret = ( ( doc.post_votes as unknown ) as Doc<any, any, any> ).get( `${post_id}` );
                doc.post_votes[post_id] = new_vote;
                ( ( doc.post_votes as unknown ) as Doc<any, any, any> ).set( `${post_id}`, new_vote, { session } );
                // ( doc.post_votes as any )?.set( '' + post_id, new_vote );
                console.log( post_id, new_vote, doc );
                await doc.save( { session } );
                return ret;
            } );
    }
}
