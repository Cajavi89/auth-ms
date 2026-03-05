/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { PrismaClient } from 'generated/prisma/client';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './dto/interfaces/jwt-payload.interface';
import { envs } from 'src/config/envs';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('AuthService');

  constructor(private readonly jwtService: JwtService) {
    super();
  }

  onModuleInit() {
    this.$connect();
    this.logger.log('Auth-MS-MONGO conected');
  }

  async signJWT(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  async register(registerUserDto: RegisterUserDto) {
    try {
      const user = await this.user.findUnique({
        where: {
          email: registerUserDto.email,
        },
      });

      if (user) {
        throw new RpcException({
          status: 400,
          message: 'User already exists',
        });
      }

      const newUser = await this.user.create({
        data: {
          name: registerUserDto.name,
          email: registerUserDto.email,
          password: bcrypt.hashSync(registerUserDto.password, 10),
        },
      });

      // return newUser;
      await this.user.create({
        data: newUser,
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...rest } = newUser;

      return {
        user: rest,
        token: await this.signJWT(rest),
      };
    } catch (e) {
      throw new RpcException({
        status: 400,
        message: e.message,
      });
    }
  }

  async login(loginUserDto: LoginUserDto) {
    try {
      const user = await this.user.findUnique({
        where: {
          email: loginUserDto.email,
        },
      });

      if (!user) {
        throw new RpcException({
          status: 400,
          message: 'Invalid credentials',
        });
      }

      const isPassValid = bcrypt.compareSync(
        loginUserDto.password,
        user.password,
      );

      if (!isPassValid) {
        throw new RpcException({
          status: 400,
          message: 'User/password not valid',
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...rest } = user;

      return {
        user: rest,
        token: await this.signJWT(rest),
      };
    } catch (e) {
      throw new RpcException({
        status: 400,
        message: e.message,
      });
    }
  }

  async verifyToken(token: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
        secret: envs.jwtSecret,
      });

      return {
        user: user,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        token: await this.signJWT(user),
      };
    } catch {
      throw new RpcException({
        status: 401,
        message: `Token no valid`,
      });
    }
    return 'usuario verificado';
  }
}
