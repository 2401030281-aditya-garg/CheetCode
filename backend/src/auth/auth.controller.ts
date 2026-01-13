import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(private userService: UserService) {}

  @Post('sync')
  async syncUser(@Body() body: { email: string; name?: string }) {
    const { email, name } = body;

    let user = await this.userService.findByEmail(email);

    if (!user) {
      user = await this.userService.createUser(email, name);
    }

    return user;
  }
}
