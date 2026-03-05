import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor() {}

  register() {
    return 'usuario registrado';
  }
  login() {
    return 'usuario logueado';
  }
  verifyToken() {
    return 'usuario verificado';
  }
}
