import { OnModuleInit } from "@nestjs/common";
import { EntityManager } from "typeorm";
import { RedisService } from "@/shared/services/redis.service";
import { UtilService } from "@/shared/services/util.service";
import { SysParamConfigService } from "@/modules/admin/system/param-config/param-config.service";
export declare class TGBotService implements OnModuleInit {
    private redisService;
    private entityManager;
    private util;
    private paramConfigService;
    constructor(redisService: RedisService, entityManager: EntityManager, util: UtilService, paramConfigService: SysParamConfigService);
    private tgToken;
    private bot;
    onModuleInit(): Promise<void>;
}
