import { JwtService } from '@nestjs/jwt';
import { AdminWSService } from 'src/modules/ws/admin-ws.service';
import { AdminWSGateway } from 'src/modules/ws/admin-ws.gateway';
import { EntityManager } from 'typeorm';
import { SysUserService } from '../user/user.service';
import { OnlineUserInfo } from './online.class';
export declare class SysOnlineService {
    private entityManager;
    private userService;
    private adminWsGateWay;
    private adminWSService;
    private jwtService;
    constructor(entityManager: EntityManager, userService: SysUserService, adminWsGateWay: AdminWSGateway, adminWSService: AdminWSService, jwtService: JwtService);
    listOnlineUser(currentUid: number): Promise<OnlineUserInfo[]>;
    kickUser(uid: number, currentUid: number): Promise<void>;
    findLastLoginInfoList(ids: number[], currentUid: number): Promise<OnlineUserInfo[]>;
}
