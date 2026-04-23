import { IsString, IsUUID } from 'class-validator';

export class RespondRequestDto {
  @IsString()
  decision!: 'approve' | 'reject';

  @IsUUID()
  requestId!: string;
}
