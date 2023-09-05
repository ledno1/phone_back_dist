import { Repository } from "typeorm";
import { RedisService } from "@/shared/services/redis.service";
import { UtilService } from "@/shared/services/util.service";
import { IAdminUser } from "@/modules/admin/admin.interface";
import { Channel } from "@/entities/resource/channel.entity";
import { SysUserService } from "@/modules/admin/system/user/user.service";
import { SysParamConfigService } from "@/modules/admin/system/param-config/param-config.service";
import { TakeLinkService } from "@/modules/resource/takeLink/takeLink.service";
import { GetChannelInfo } from "@/modules/resource/channel/interFace/inter";
export declare class ChannelService {
    private userService;
    private channelRepository;
    private redisService;
    private paramsConfig;
    private takeLinkService;
    private util;
    constructor(userService: SysUserService, channelRepository: Repository<Channel>, redisService: RedisService, paramsConfig: SysParamConfigService, takeLinkService: TakeLinkService, util: UtilService);
    page(params: any, user: IAdminUser): Promise<Channel[] | {
        list: any;
        pagination: {
            total: any;
            page: number;
            size: number;
        };
    }>;
    add(params: any, user: IAdminUser): Promise<string>;
    edit(params: any, user: IAdminUser): Promise<void>;
    proxyChargingChannel(): Promise<Channel[]>;
    channelRoot(): Promise<Channel[]>;
    channelList(user: IAdminUser): Promise<Channel[]>;
    getSubChannel(rootChannelId: number, isUse?: number): Promise<Channel[]>;
    getRateByChannelId(userId: number, id: number, uuid: string): Promise<number>;
    getChannelInfo(id: number | string): Promise<GetChannelInfo>;
    getChannelIdByName(name: string): Promise<number>;
    getStrategyByChannelId(id: number): Promise<number>;
}
