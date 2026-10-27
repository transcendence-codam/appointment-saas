import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";

export const TenantId = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const tenantId = request.user?.tenantId;
    if (!tenantId)
        throw new UnauthorizedException();
    return tenantId;
})