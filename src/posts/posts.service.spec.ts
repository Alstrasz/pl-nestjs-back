import { describe_with_db, TestContext } from 'src/abstract_spec';
import { PostsModule } from './posts.module';
import { PostsService } from './posts.service';

let posts_service: PostsService;

describe_with_db(
    'PostsService',
    [PostsModule],
    ( context: TestContext ) => {
        posts_service = context.module.get<PostsService>( PostsService );
    },
    () => {
        it( 'should be defined', () => {
            expect( posts_service ).toBeDefined();
        } );
    },
);
