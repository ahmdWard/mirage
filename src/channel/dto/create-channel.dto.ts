import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum ChannelType {
  TEXT = 'text',
  VOICE = 'voice',
}
export class CreateChannelDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEnum(ChannelType, {
    message: 'Type must be either text or voice',
  })
  type: ChannelType;

  @IsNotEmpty()
  severId: number;
}
