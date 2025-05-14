import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
    findOneByEmail(email: string) {
        throw new Error('Method not implemented.');
    }
    findById(sub: number) {
        throw new Error('Method not implemented.');
    }
}
