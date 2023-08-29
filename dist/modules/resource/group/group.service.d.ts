import { Repository } from "typeorm";
import { RedisService } from "@/shared/services/redis.service";
import { UtilService } from "@/shared/services/util.service";
import { IAdminUser } from "@/modules/admin/admin.interface";
import { Group } from "@/entities/resource/group.entity";
import { ZhService } from "@/modules/resource/zh/zh.service";
import { ProxyService } from "@/modules/usersys/proxy/proxy.service";
export declare class GroupService {
    private groupRepository;
    private redisService;
    private zhService;
    private proxyUserService;
    private util;
    constructor(groupRepository: Repository<Group>, redisService: RedisService, zhService: ZhService, proxyUserService: ProxyService, util: UtilService);
    page(params: any, user: IAdminUser): Promise<Group[] | {
        list: Group[];
        pagination: {
            total: number;
            page: number;
            size: number;
        };
    }>;
    add(params: any, user: IAdminUser): Promise<void>;
    edit(params: any, user: IAdminUser): Promise<void>;
}
