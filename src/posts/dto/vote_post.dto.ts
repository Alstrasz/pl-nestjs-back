import { IsBoolean, IsOptional } from 'class-validator';

export class VotePostDto {
    @IsOptional()
    @IsBoolean()
        vote?: boolean;
}
