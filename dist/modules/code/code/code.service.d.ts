import { OnModuleInit } from "@nestjs/common";
import { EntityManager } from "typeorm";
import { RedisService } from "@/shared/services/redis.service";
import { UtilService } from "@/shared/services/util.service";
import { SysPay } from "@/modules/api/APIInterFace/interface";
import { OrderRedis } from "../../api/subHandler/InerFace";
import { TestHandlerService } from "@/modules/code/subHandler/test.service";
import { PayCodeServiceHandler } from "@/modules/code/subHandler/InerFace";
import { ChannelService } from "@/modules/resource/channel/channel.service";
import { PayCodeProductService } from "@/modules/code/product/product.service";
import { KaKaCheckPhoneHandlerService } from "@/modules/code/subHandler/kakaCheckPhone.service";
export declare class CodeService implements OnModuleInit {
    private redisService;
    private entityManager;
    private testService;
    private channelService;
    private productService;
    private kakaCheckPhoneHandlerService;
    private util;
    constructor(redisService: RedisService, entityManager: EntityManager, testService: TestHandlerService, channelService: ChannelService, productService: PayCodeProductService, kakaCheckPhoneHandlerService: KaKaCheckPhoneHandlerService, util: UtilService);
    handlerMap: Map<number, PayCodeServiceHandler>;
    onModuleInit(): Promise<void>;
    createPayCodeByChannel(params: SysPay, orderRedis: OrderRedis): Promise<void>;
    createPayCodeByProduct(params: SysPay, orderRedis: OrderRedis, productId: number | string): Promise<any>;
    checkOrderByProduct(params: SysPay, orderRedis: OrderRedis, productId: number | string): Promise<any>;
    checkPhoneBalanceByChannel(orderRedis: OrderRedis): Promise<void>;
    checkPhoneBalanceByProduct(orderRedis: OrderRedis, productId: number | string): Promise<any>;
}
