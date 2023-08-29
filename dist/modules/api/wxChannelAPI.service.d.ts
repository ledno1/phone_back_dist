import { EntityManager } from "typeorm";
import { RedisService } from "@/shared/services/redis.service";
import { UtilService } from "@/shared/services/util.service";
import { TopService } from "@/modules/usersys/top/top.service";
import { ProxyService } from "@/modules/usersys/proxy/proxy.service";
import { OrderTopService } from "@/modules/api/top/orderTop.service";
import { SysParamConfigService } from "@/modules/admin/system/param-config/param-config.service";
import { ChannelService } from "@/modules/resource/channel/channel.service";
import { TakeLink } from "@/entities/resource/takeLinkAPI.entity";
export declare class WxChannelAPIService {
    private redisService;
    private entityManager;
    private paramConfigService;
    private channelService;
    private topUserService;
    private proxyUserService;
    private topOrderService;
    private util;
    private readonly queueKey;
    private readonly lastUuidKey;
    constructor(redisService: RedisService, entityManager: EntityManager, paramConfigService: SysParamConfigService, channelService: ChannelService, topUserService: TopService, proxyUserService: ProxyService, topOrderService: OrderTopService, util: UtilService);
    getByStrategy(body: any): Promise<any>;
    getSubChannelByQueue(subChannelList: any): Promise<any>;
    getSubChannelByWeight(subChannelList: any): Promise<void>;
    getSubChannelByRandom(subChannelList: any): Promise<void>;
    getLinkByStrategy(body: any): Promise<void>;
    getLinkFromAPIByStrategy(subChannelId: number, takeLinks: TakeLink[], body: any): Promise<any>;
    getLinkByAPIKey(takeLink: TakeLink, body: any): Promise<any>;
}
