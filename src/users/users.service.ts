import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { Model, Document as Doc } from 'mongoose';
import { CreateUserDto } from 'src/auth/dto/create_user.dto';
import { v4 as uuidv4 } from 'uuid';
import { ROLE } from 'src/auth/enums/role.enum';
import { admin_username, db_error_codes } from 'src/constatns';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService implements OnModuleInit {
    constructor (
        @InjectModel( User.name ) private user_model: Model<UserDocument>,
        private config_service: ConfigService,
    ) {
    }

    async onModuleInit () {
        const logger = new Logger( 'HTTP' );
        await this.add_admin_user().catch( ( err ) => {
            logger.error( `While creating admin user ${err}` );
        } );
    }


    /**
     * Creates admin document in user collection if one not exists. While creating sets password to admin or ADMIN_PASSWORD variable from config
     * Does not update password if document already exists
     *
     */
    async add_admin_user () {
        return this.create( { username: admin_username, password_hash: this.config_service.get( 'ADMIN_PASSWORD' ) || 'admin' }, [ROLE.USER, ROLE.ADMIN] )
            .then( () => {
                return true;
            } )
            .catch( ( err ) => {
                if ( err.code == db_error_codes.collizion ) {
                    return true;
                } else {
                    throw err;
                }
            } );
    }


    /**
     * Creates document in user collection
     *
     * @param {CreateUserDto} create_user_dto
     * @param {Array<ROLE>} [roles]
     * @return {*}  {Promise<User>}
     */
    async create ( create_user_dto: CreateUserDto, roles?: Array<ROLE> ): Promise<User | null> {
        const created_user = new this.user_model( {
            uuid: uuidv4(),
            username: create_user_dto.username,
            password_hash: create_user_dto.password_hash,
            registration_date_in_seconds: ( new Date() ).getTime(),
            roles: roles,
        } );
        return ( await created_user.save() as any )?._doc || null;
    }


    /**
     * Returns documemt from user collection with matching user. Null if one does not exists
     *
     * @param {string} username
     * @return {*}  {Promise<User>}
     */
    async get_user_by_username ( username: string ): Promise<User | null> {
        return ( await this.user_model.findOne( { username: username } ) as any )?._doc || null;
    }


    /**
     * Updates roles for user
     *
     * @param {string} username
     * @param {Array<string>} new_roles
     */
    async set_roles ( username: string, new_roles: Array<ROLE> ): Promise<User | null> {
        return ( await this.user_model.findOneAndUpdate( { username: username }, { $set: { roles: new_roles } }, { returnOriginal: false } ) as any )?._doc || null;
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
                await doc.save( { session } );
                return ret;
            } );
    }
}
