import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(contex: ExecutionContext) {
    const req = contex.switchToHttp().getRequest();
    const user = req.user;
    if (user && user.admin) {
      return true;
    }
    throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
  }
}
