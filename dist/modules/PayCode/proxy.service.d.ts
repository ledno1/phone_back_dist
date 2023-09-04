import { OnModuleInit } from "@nestjs/common";
import { EntityManager } from "typeorm";
import { RedisService } from "@/shared/services/redis.service";
import { UtilService } from "@/shared/services/util.service";
export declare class ProxyService implements OnModuleInit {
    private redisService;
    private entityManager;
    private util;
    constructor(redisService: RedisService, entityManager: EntityManager, util: UtilService);
    onModuleInit(): any;
}
