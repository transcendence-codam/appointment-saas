import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class DevAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    console.log('DevAuthGuard ran, DEV_TENANT_ID =', process.env.DEV_TENANT_ID);
    context.switchToHttp().getRequest().user = { tenantId: process.env.DEV_TENANT_ID };
    return true;
  }
}
