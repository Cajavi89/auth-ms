import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @MessagePattern('auth.register.user')
  async register(@Payload() registerUserDto: RegisterUserDto) {
    return await this.authService.register(registerUserDto);
  }

  @MessagePattern('auth.login.user')
  async login(@Payload() loginUserDto: LoginUserDto) {
    return await this.authService.login(loginUserDto);
  }

  @MessagePattern('auth.verify.user')
  verifyToken(@Payload() token: string) {
    return this.authService.verifyToken(token);
  }
}
