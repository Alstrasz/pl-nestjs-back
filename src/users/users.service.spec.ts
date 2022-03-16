import { describe_with_db, TestContext } from 'src/abstract_spec';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';


let auth_service: UsersService;

describe_with_db(
    'UsersService',
    [UsersModule],
    async ( context: TestContext ) => {
        auth_service = context.module.get<UsersService>( UsersService );
    },
    () => {
        it( 'should be defined', () => {
            expect( auth_service ).toBeDefined();
        } );
    },
);
