import { Injectable } from '@nestjs/common';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class UsersService {
    private readonly users: Array<User> = [
        {
            username: 'john',
            password_hash: 'changeme',
            registration_date_in_seconds: 255,
            ratings: [],
        },
        {
            username: 'maria',
            password_hash: 'guess',
            registration_date_in_seconds: 255,
            ratings: [],
        },
    ];

    async findOne ( username: string ): Promise<User | undefined> {
        return this.users.find( ( user ) => user.username === username );
    }
}
