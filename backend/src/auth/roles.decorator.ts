import { SetMetadata } from '@nestjs/common';

// This decorator will add the required roles to the route handler
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
