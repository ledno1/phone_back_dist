import { RedisService } from "@/shared/services/redis.service";
import { UtilService } from "@/shared/services/util.service";
export declare class OrderSellService {
    private redisService;
    private util;
    constructor(redisService: RedisService, util: UtilService);
}
