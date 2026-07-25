import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Request() req) {
    return this.usersService.getMe(req.user.userId);
  }

  @Patch('me')
  async updateMe(@Request() req, @Body() body: UpdateUserDto) {
    return this.usersService.updateMe(req.user.userId, body);
  }

  @Patch('password')
  async changePassword(@Request() req, @Body() body: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.userId, body);
  }
}
