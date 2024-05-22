import { Module } from '@nestjs/common';
import { CharacterService } from './character.service';
import { CharacterController } from './character.controller';

@Module({
  providers: [CharacterService],
  controllers: [CharacterController]
})
export class CharacterModule {}
