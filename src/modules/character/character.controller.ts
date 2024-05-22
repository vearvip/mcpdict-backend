import { Controller, Get, Param } from '@nestjs/common';
import { CharacterService } from './character.service';
import { Public } from "src/utils/decorators";

@Controller('character')
export class CharacterController {
  constructor(private readonly characterService: CharacterService) {}

  @Public()
  @Get('/query/:char')
  queryCharacter(@Param('char') char: string) {
    // return 'xxx'
    return this.characterService.queryCharacterPronunciationsGroupedByDialect(char);
  }
}
