import { EntityManager, Repository } from "typeorm";
import { RedisService } from "@/shared/services/redis.service";
import { UtilService } from "@/shared/services/util.service";
import { BackIP } from "@/entities/resource/backip.entity";
import { IAdminUser } from "@/modules/admin/admin.interface";
export declare class IpBackListService {
    private backIPRepository;
    private redisService;
    private entityManager;
    private util;
    constructor(backIPRepository: Repository<BackIP>, redisService: RedisService, entityManager: EntityManager, util: UtilService);
    page(params: any, user: IAdminUser): Promise<{
        list: BackIP[];
        pagination: {
            total: number;
            page: number;
            size: number;
        };
    }>;
    edit(params: any, user: IAdminUser): Promise<number>;
    add(params: any, user: IAdminUser): Promise<number>;
}
