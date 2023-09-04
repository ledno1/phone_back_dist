import { OnModuleInit } from "@nestjs/common";
import { EntityManager } from "typeorm";
import { RedisService } from "@/shared/services/redis.service";
import { UtilService } from "@/shared/services/util.service";
import { IAdminUser } from "@/modules/admin/admin.interface";
export declare class PayCodeProductService implements OnModuleInit {
    private redisService;
    private entityManager;
    private util;
    constructor(redisService: RedisService, entityManager: EntityManager, util: UtilService);
    onModuleInit(): any;
    page(params: any, user: IAdminUser): Promise<{
        list: any;
        pagination: {
            total: any;
            page: number;
            size: number;
        };
    }>;
    add(body: any, user: IAdminUser): any;
    edit(body: any, user: IAdminUser): any;
    delete(body: any, user: any): any;
}
