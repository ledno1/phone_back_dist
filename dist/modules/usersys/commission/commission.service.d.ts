import { RedisService } from "@/shared/services/redis.service";
import { UtilService } from "@/shared/services/util.service";
import { IAdminUser } from "@/modules/admin/admin.interface";
import { EntityManager, Repository } from "typeorm";
import { SysBalanceLog } from "@/entities/admin/sys-balance.entity";
import SysUser from "@/entities/admin/sys-user.entity";
import { SysParamConfigService } from "@/modules/admin/system/param-config/param-config.service";
import { ConfigService } from "@nestjs/config";
import { ConfigurationKeyPaths } from "@/config/configuration";
export declare class CommissionService {
    private logRepository;
    private readonly configService;
    private userRepository;
    private entityManager;
    private paramConfigService;
    private redisService;
    private util;
    private appName;
    constructor(logRepository: Repository<SysBalanceLog>, configService: ConfigService<ConfigurationKeyPaths>, userRepository: Repository<SysUser>, entityManager: EntityManager, paramConfigService: SysParamConfigService, redisService: RedisService, util: UtilService);
    page(params: any, user: IAdminUser): Promise<{
        list: any;
        pagination: {
            total: any;
            page: number;
            size: number;
        };
    }>;
    statistics(params: any, user: IAdminUser): Promise<{
        googleCodeBind: boolean;
    } | {
        ZHCount: any;
        todayOrder: any;
        todaySale: any;
        yesterdayOrder: any;
        yesterdaySale: any;
        link: any;
        sysOpen: boolean;
        googleCodeBind: boolean;
        channelList: any;
    }>;
    edit(params: any, user: IAdminUser): Promise<string | 1>;
}
