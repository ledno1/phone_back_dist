import { OnModuleInit } from "@nestjs/common";
import { EntityManager } from "typeorm";
import { RedisService } from "@/shared/services/redis.service";
import { UtilService } from "@/shared/services/util.service";
import { SysPay } from "@/modules/api/APIInterFace/interface";
import { OrderRedis } from "../../api/subHandler/InerFace";
export declare class CodeService implements OnModuleInit {
    private redisService;
    private entityManager;
    private util;
    constructor(redisService: RedisService, entityManager: EntityManager, util: UtilService);
    onModuleInit(): Promise<void>;
    createPayCodeByChannel(params: SysPay, orderRedis: OrderRedis): Promise<void>;
    createPayCodeByProduct(): void;
}
