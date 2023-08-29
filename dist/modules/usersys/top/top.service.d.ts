import { RedisService } from "@/shared/services/redis.service";
import { UtilService } from "@/shared/services/util.service";
import { IAdminUser } from "@/modules/admin/admin.interface";
import { EntityManager, Repository } from "typeorm";
import { AddTopUser } from "@/modules/usersys/top/interfaceClass";
import { SysParamConfigService } from "@/modules/admin/system/param-config/param-config.service";
import SysUser from "@/entities/admin/sys-user.entity";
export declare class TopService {
    private paramConfigService;
    private entityManager;
    private userRepository;
    private redisService;
    private util;
    constructor(paramConfigService: SysParamConfigService, entityManager: EntityManager, userRepository: Repository<SysUser>, redisService: RedisService, util: UtilService);
    page(params: any, user: IAdminUser): Promise<{
        list: SysUser[];
        pagination: {
            total: number;
            page: number;
            size: number;
        };
    }>;
    add(params: AddTopUser, user: IAdminUser): Promise<void>;
    edit(params: any, user: IAdminUser): Promise<void>;
    userInfoById(id: number): Promise<SysUser>;
    getMd5Key(id: number): Promise<any>;
    getPayUser(amount: number): Promise<SysUser[]>;
}
