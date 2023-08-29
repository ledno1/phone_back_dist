import { Repository } from "typeorm";
import { RedisService } from "@/shared/services/redis.service";
import { UtilService } from "@/shared/services/util.service";
import { IAdminUser } from "@/modules/admin/admin.interface";
import { SysUserService } from "@/modules/admin/system/user/user.service";
import { SysParamConfigService } from "@/modules/admin/system/param-config/param-config.service";
import { TakeLink } from "@/entities/resource/takeLinkAPI.entity";
export declare class TakeLinkService {
    private userService;
    private takeLinkRepository;
    private redisService;
    private paramsConfig;
    private util;
    constructor(userService: SysUserService, takeLinkRepository: Repository<TakeLink>, redisService: RedisService, paramsConfig: SysParamConfigService, util: UtilService);
    page(params: any, user: IAdminUser): Promise<TakeLink[] | {
        list: TakeLink[];
        pagination: {
            total: number;
            page: number;
            size: number;
        };
    }>;
    add(params: any, user: IAdminUser): Promise<string>;
    edit(params: any, user: IAdminUser): Promise<void>;
    getManyByIds(ids: number[]): Promise<TakeLink[]>;
}
