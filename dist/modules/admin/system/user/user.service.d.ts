import SysDepartment from 'src/entities/admin/sys-department.entity';
import SysUserRole from 'src/entities/admin/sys-user-role.entity';
import SysUser from 'src/entities/admin/sys-user.entity';
import { UtilService } from 'src/shared/services/util.service';
import { EntityManager, Repository } from 'typeorm';
import { RedisService } from 'src/shared/services/redis.service';
import { SysParamConfigService } from '../param-config/param-config.service';
import { AccountInfo, PageSearchUserInfo } from './user.class';
import { CreateUserDto, PageSearchUserDto, UpdatePasswordDto, UpdateUserDto, UpdateUserInfoDto } from './user.dto';
import SysRole from '@/entities/admin/sys-role.entity';
export declare class SysUserService {
    private userRepository;
    private departmentRepository;
    private userRoleRepository;
    private sysRoleRepository;
    private redisService;
    private paramConfigService;
    private entityManager;
    private rootRoleId;
    private util;
    constructor(userRepository: Repository<SysUser>, departmentRepository: Repository<SysDepartment>, userRoleRepository: Repository<SysUserRole>, sysRoleRepository: Repository<SysRole>, redisService: RedisService, paramConfigService: SysParamConfigService, entityManager: EntityManager, rootRoleId: number, util: UtilService);
    getParents(uid: number): Promise<any>;
    getParentsRate(uid: number): Promise<any>;
    findUserByUserName(username: string): Promise<SysUser | undefined>;
    getAccountInfo(uid: number, ip?: string): Promise<AccountInfo>;
    updatePersonInfo(uid: number, info: UpdateUserInfoDto): Promise<void>;
    updatePassword(uid: number, dto: UpdatePasswordDto): Promise<void>;
    forceUpdatePassword(uid: number, password: string): Promise<void>;
    add(param: CreateUserDto): Promise<void>;
    update(param: UpdateUserDto): Promise<void>;
    findUserIdByNameOrId(nameOrId: string): Promise<SysUser>;
    info(id: number): Promise<SysUser & {
        roles: number[];
        departmentName: string;
    }>;
    infoList(ids: number[]): Promise<SysUser[]>;
    delete(userIds: number[]): Promise<void | never>;
    count(uid: number, deptIds: number[]): Promise<number>;
    findRootUserId(): Promise<number>;
    list(user: any): Promise<any>;
    page(uid: number, params: PageSearchUserDto): Promise<[PageSearchUserInfo[], number]>;
    forbidden(uid: number): Promise<void>;
    multiForbidden(uids: number[]): Promise<void>;
    upgradePasswordV(id: number): Promise<void>;
}
