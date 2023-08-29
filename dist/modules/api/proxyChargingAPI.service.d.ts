import { EntityManager } from "typeorm";
import { RedisService } from "@/shared/services/redis.service";
import { UtilService } from "@/shared/services/util.service";
import { LinkObject } from "@/modules/api/dto/interface";
import { TopService } from "@/modules/usersys/top/top.service";
import { ProxyService } from "@/modules/usersys/proxy/proxy.service";
import { OrderTopService } from "@/modules/api/top/orderTop.service";
import { ProxyChargingService } from "@/modules/resource/proxyCharging/proxyChargin.service";
import { ChannelService } from "@/modules/resource/channel/channel.service";
import { ProxyCharging } from "@/entities/resource/proxyChargin.entity";
import { TakeLink } from "@/entities/resource/takeLinkAPI.entity";
import { Queue } from "bull";
export type ProxyChargingUser = {
    proxyChargingInfo: ProxyCharging;
    user: any;
};
export declare class ProxyChargingAPIService {
    private redisService;
    private entityManager;
    private topUserService;
    private proxyUserService;
    private proxyChargingService;
    private channelService;
    private topOrderService;
    private orderQueue;
    private util;
    private readonly queueKey;
    private readonly lastUuidKey;
    constructor(redisService: RedisService, entityManager: EntityManager, topUserService: TopService, proxyUserService: ProxyService, proxyChargingService: ProxyChargingService, channelService: ChannelService, topOrderService: OrderTopService, orderQueue: Queue, util: UtilService);
    getByStrategy(body: any): Promise<any>;
    defaultStrategy(linkObject: LinkObject): Promise<ProxyChargingUser> | null;
    getLinkFromAPIByStrategy(proxyCharging: ProxyChargingUser, takeLinks: TakeLink[], body: any, oid: any): Promise<any>;
    getLinkByAPIKey(takeLink: TakeLink, body: any, proxyCharging: ProxyChargingUser, oid: any): Promise<any>;
    proxyChargingReset(job: any): Promise<void>;
}
