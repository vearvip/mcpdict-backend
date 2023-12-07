import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { Public } from 'src/utils/decorators';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Public()
  @Post('login')
  signIn(@Body() body) {
    // console.log('🔥', body)
    return this.userService.signIn(body.email, body.password);
  }
}
