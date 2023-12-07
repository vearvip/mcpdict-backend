// users.service.ts

import { Injectable, NotFoundException } from '@nestjs/common'; 

@Injectable()
export class AppService {
  private users = [];

  create(createUserDto: any) {
    const newUser = { id: Date.now(), ...createUserDto };
    this.users.push(newUser);
    return newUser; // 只返回 newUser 对象，不要返回 Result 对象
  }

  findOne(id: string) {
    // 这里应该有一些实际的数据库逻辑
    const user = this.users.find(u => u.id === Number(id));
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  remove(id: string) {
    // 这里应该有一些实际的数据库逻辑
    const index = this.users.findIndex(u => u.id === Number(id));
    if (index === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.users.splice(index, 1);
  }
}
