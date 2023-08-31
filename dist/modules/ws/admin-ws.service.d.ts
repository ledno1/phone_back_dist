import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import SysRoleMenu from 'src/entities/admin/sys-role-menu.entity';
import SysUserRole from 'src/entities/admin/sys-user-role.entity';
import { AdminWSGateway } from 'src/modules/ws/admin-ws.gateway';
import { RemoteSocket } from 'socket.io';
export declare class AdminWSService {
    private jwtService;
    private roleMenuRepository;
    private userRoleRepository;
    private adminWsGateWay;
    constructor(jwtService: JwtService, roleMenuRepository: Repository<SysRoleMenu>, userRoleRepository: Repository<SysUserRole>, adminWsGateWay: AdminWSGateway);
    getOnlineSockets(): Promise<RemoteSocket<import("socket.io/dist/typed-events").DefaultEventsMap, any>[]>;
    findSocketIdByUid(uid: number): Promise<RemoteSocket<unknown, unknown>>;
    filterSocketIdByUidArr(uids: number[]): Promise<RemoteSocket<unknown, unknown>[]>;
    noticeUserToUpdateMenusByUserIds(uid: number | number[]): Promise<void>;
    noticeUserToUpdateMenusByMenuIds(menuIds: number[]): Promise<void>;
    noticeUserToUpdateMenusByRoleIds(roleIds: number[]): Promise<void>;
}
