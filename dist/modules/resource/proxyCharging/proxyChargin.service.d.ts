import { OnModuleInit } from "@nestjs/common";
import { EntityManager, Repository } from "typeorm";
import { RedisService } from "@/shared/services/redis.service";
import { UtilService } from "@/shared/services/util.service";
import { IAdminUser } from "@/modules/admin/admin.interface";
import { Channel } from "@/entities/resource/channel.entity";
import { SysUserService } from "@/modules/admin/system/user/user.service";
import { SysParamConfigService } from "@/modules/admin/system/param-config/param-config.service";
import { ProxyCharging } from "@/entities/resource/proxyChargin.entity";
import { ChannelService } from "@/modules/resource/channel/channel.service";
export declare class ProxyChargingService implements OnModuleInit {
    private userService;
    private channelRepository;
    private entityManager;
    private proxyChargingRepository;
    private redisService;
    private paramsConfig;
    private channelService;
    private util;
    private DIANXINCHANNEL;
    private LIANTONGCHANNEL;
    private YIDONGCHANNEL;
    constructor(userService: SysUserService, channelRepository: Repository<Channel>, entityManager: EntityManager, proxyChargingRepository: Repository<ProxyCharging>, redisService: RedisService, paramsConfig: SysParamConfigService, channelService: ChannelService, util: UtilService);
    onModuleInit(): Promise<void>;
    page(params: any, user: IAdminUser): Promise<{
        label: string;
        value: string;
    }[] | {
        list: any[];
        pagination: {
            total: number;
            page: number;
            size: number;
        };
    }>;
    add(params: any, user: IAdminUser): Promise<string>;
    isProhibit(name: string, operator: string): Promise<void>;
    edit(params: any, user: IAdminUser): Promise<string>;
    resetStatusAndLock(data: any): Promise<void>;
    upDateCreateStatus(id: number): Promise<void>;
    updateOnOrderCreate(id: number, oid: string, mOid: string): Promise<void>;
    resetOnOutTime(id: number): Promise<void>;
    getByAmount(params: any): Promise<string[]>;
    setStatus(id: number, state: number): Promise<void>;
    getPhoneOrder(params: any): Promise<ProxyCharging> | null;
}
