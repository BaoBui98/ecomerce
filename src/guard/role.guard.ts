import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY } from '../decorator/role.decorator';
import { UserRole } from '../user/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Đọc các role được cấu hình trên handler hoặc class của controller
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2. Nếu không cấu hình role nào yêu cầu, cả Admin và User đều được phép truy cập
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 3. Lấy thông tin user được gắn vào request bởi AuthGuard
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 4. Nếu không có user hoặc role của user không nằm trong danh sách yêu cầu
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Bạn không có quyền truy cập chức năng này');
    }

    return true;
  }
}
