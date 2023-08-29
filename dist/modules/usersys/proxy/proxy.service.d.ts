import { RedisService } from "@/shared/services/redis.service";
import { UtilService } from "@/shared/services/util.service";
import { SysParamConfigService } from "@/modules/admin/system/param-config/param-config.service";
import { EntityManager, Repository } from "typeorm";
import SysUser from "@/entities/admin/sys-user.entity";
import { IAdminUser } from "@/modules/admin/admin.interface";
export declare class ProxyService {
    private paramConfigService;
    private entityManager;
    private userRepository;
    private redisService;
    private util;
    private readonly PROXYUSER;
    constructor(paramConfigService: SysParamConfigService, entityManager: EntityManager, userRepository: Repository<SysUser>, redisService: RedisService, util: UtilService);
    page(params: any, user: IAdminUser): Promise<{
        list: any;
        pagination: {
            total: number;
            page: number;
            size: number;
        };
    }>;
    pageByAdmin(params: any, user: IAdminUser): Promise<{
        list: any;
        pagination: {
            total: number;
            page: number;
            size: number;
        };
    }>;
    pageByUser(params: any, user: IAdminUser): Promise<{
        list: any;
        pagination: {
            total: number;
            page: number;
            size: number;
        };
    }>;
    add(params: any, user: IAdminUser): Promise<void>;
    edit(params: any, user: IAdminUser): Promise<void>;
    proxyDeduction(params: any, user: IAdminUser): Promise<void>;
    del(params: any, user: IAdminUser): Promise<void>;
    getInstantiationByUserId(userId: number): Promise<SysUser>;
    checkBalance(uuid: any, amount: any): Promise<false | SysUser>;
    updateBalance(uuid: any, amount: any, typeEnum: any): Promise<number | any>;
    setOrderCommission(oInfo: any): Promise<void>;
}
