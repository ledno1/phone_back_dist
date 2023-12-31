import { OnModuleInit } from "@nestjs/common";
import { EntityManager } from "typeorm";
import { RedisService } from "@/shared/services/redis.service";
import { UtilService } from "@/shared/services/util.service";
import { ALiPayNotify, PayResponse, SysPay } from "@/modules/api/APIInterFace/interface";
import { ChannelType, HaveAmount, OrderRedis, PayAccountAndMerchant, ProcessModel, ProxyChargingAndMerchant, ServiceHandler } from "@/modules/api/subHandler/InerFace";
import { TopService } from "@/modules/usersys/top/top.service";
import { ProxyService } from "@/modules/usersys/proxy/proxy.service";
import { PayAccount } from "@/entities/resource/payaccount.entity";
import { ProxyCharging } from "@/entities/resource/proxyChargin.entity";
import { CodeService } from "@/modules/code/code/code.service";
import { ChannelService } from "@/modules/resource/channel/channel.service";
import { SysParamConfigService } from "@/modules/admin/system/param-config/param-config.service";
export declare class PayCodePhoneChargingHandlerService implements ServiceHandler, OnModuleInit {
    private redisService;
    private entityManager;
    private topUserService;
    private proxyUserService;
    private paramConfigService;
    private channelService;
    private util;
    codeService: CodeService;
    constructor(redisService: RedisService, entityManager: EntityManager, topUserService: TopService, proxyUserService: ProxyService, paramConfigService: SysParamConfigService, channelService: ChannelService, util: UtilService, codeService: CodeService);
    private matchTime;
    private CheckModePhoneProxyChargingMaxCount;
    host: string;
    autoCallback(params: ALiPayNotify, p: PayAccount): Promise<void>;
    test(): Promise<void>;
    private redlock;
    private readonly queueKey;
    private readonly lastUuidKey;
    channelType: ChannelType;
    nameKey: string;
    onModuleInit(): Promise<void>;
    result(params: SysPay): Promise<PayResponse>;
    haveAmount(params: SysPay): Promise<HaveAmount[]>;
    findMerchant(params: SysPay, payUserQueue: HaveAmount[], oid: string): Promise<ProxyChargingAndMerchant | PayAccountAndMerchant | null>;
    findProxyChargingAndUpdate(params: SysPay, user: HaveAmount, oid: string): Promise<ProxyCharging>;
    findPayAccountAndUpdate(params: SysPay): Promise<PayAccount>;
    getApiUrl(params: any): Promise<void>;
    createOrder(params: SysPay, account: ProxyChargingAndMerchant | null, oid: string): Promise<void>;
    checkOrder(params: SysPay): Promise<void>;
    rollback(params: SysPay, resource: PayAccount | ProxyCharging | null, user: HaveAmount | null, oid: string): Promise<void>;
    updateMerchant(params: SysPay, user: HaveAmount): Promise<void>;
    redisOrderName: string;
    defaultSystemOutTime: number;
    model: ProcessModel;
    checkOrderApi(params: OrderRedis): Promise<boolean>;
    outTime(params: OrderRedis): Promise<void>;
    checkOrderBySql(params: OrderRedis): Promise<boolean>;
}
