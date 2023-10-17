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
import { DirectBack, DirectPush } from "@/modules/api/APIInterFace/interface";
import { CheckLog } from "@/entities/resource/checklog.entity";
import { CodeService } from "@/modules/code/code/code.service";
export declare class ProxyChargingService implements OnModuleInit {
    private userService;
    private channelRepository;
    private entityManager;
    private proxyChargingRepository;
    private redisService;
    private paramsConfig;
    private channelService;
    private codeService;
    private util;
    private DIANXINCHANNEL;
    private LIANTONGCHANNEL;
    private YIDONGCHANNEL;
    constructor(userService: SysUserService, channelRepository: Repository<Channel>, entityManager: EntityManager, proxyChargingRepository: Repository<ProxyCharging>, redisService: RedisService, paramsConfig: SysParamConfigService, channelService: ChannelService, codeService: CodeService, util: UtilService);
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
    edit(params: any, user: IAdminUser): Promise<"ok" | "查询失败" | CheckLog[]>;
    setStatus(id: number, state: number): Promise<void>;
    directBack(params: DirectBack): Promise<{
        code: number;
        message: string;
    }>;
    directPush(params: DirectPush): Promise<{
        code: number;
        message: string;
    }>;
    operatorType(type: string): Promise<"DIANXIN" | "LIANTONG" | "YIDONG">;
    provinceType(type: string, province: string): Promise<boolean>;
}
export declare class PhoneInfo {
    province: string;
    city: string;
    type: string;
}
