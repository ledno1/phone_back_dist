import { OnModuleInit } from "@nestjs/common";
import { EntityManager } from "typeorm";
import { RedisService } from "@/shared/services/redis.service";
import { UtilService } from "@/shared/services/util.service";
import { ALiPayNotify, PayResponse, SysPay } from "@/modules/api/APIInterFace/interface";
import { ChannelType, HaveAmount, OrderRedis, PayAccountAndMerchant, PayAccountEx, ProcessModel, ProxyChargingAndMerchant, ServiceHandler } from "@/modules/api/subHandler/InerFace";
import { TopService } from "@/modules/usersys/top/top.service";
import { ProxyService } from "@/modules/usersys/proxy/proxy.service";
import { Queue } from "bull";
import { PayAccount } from "@/entities/resource/payaccount.entity";
import { TopOrder } from "@/entities/order/top.entity";
import { SysParamConfigService } from "@/modules/admin/system/param-config/param-config.service";
import { ChannelService } from "@/modules/resource/channel/channel.service";
import { IAdminUser } from "@/modules/admin/admin.interface";
import { ProxyCharging } from "@/entities/resource/proxyChargin.entity";
import { PayCodeService } from "@/modules/paycode/code/code.service";
export declare class TopOrderRedirect extends TopOrder {
    url: string;
}
export declare class XiaoMangProxyChargingHandlerservice implements ServiceHandler, OnModuleInit {
    private redisService;
    private entityManager;
    private topUserService;
    private proxyUserService;
    private orderQueue;
    private paramConfigService;
    private channelService;
    private util;
    private payCodeService;
    constructor(redisService: RedisService, entityManager: EntityManager, topUserService: TopService, proxyUserService: ProxyService, orderQueue: Queue, paramConfigService: SysParamConfigService, channelService: ChannelService, util: UtilService, payCodeService: PayCodeService);
    onModuleInit(): Promise<void>;
    model: ProcessModel;
    defaultSystemOutTime: number;
    host: string;
    private redlock;
    private readonly lastUuidKey;
    redisOrderName: string;
    channelType: ChannelType;
    nameKey: string;
    result(params: SysPay, userinfo: IAdminUser): Promise<PayResponse>;
    haveAmount(params: SysPay): Promise<HaveAmount[]>;
    findMerchant(params: SysPay, payUserQueue: HaveAmount[], oid: string): Promise<ProxyChargingAndMerchant | PayAccountAndMerchant | null>;
    findProxyChargingAndUpdate(params: SysPay, user: HaveAmount, oid: string): Promise<ProxyCharging>;
    findPayAccountAndUpdate(params: SysPay, user: HaveAmount, oid: string): Promise<PayAccount | PayAccountEx>;
    getApiUrl(params: any): Promise<void>;
    createOrder(params: SysPay, account: ProxyChargingAndMerchant | null, oid: string): Promise<void>;
    rollback(params: SysPay, resource: PayAccount | ProxyCharging | null, user: HaveAmount | null, oid: string): Promise<void>;
    outTime(params: OrderRedis): Promise<void>;
    checkOrder(): Promise<void>;
    updateMerchant(params: SysPay, user: HaveAmount): Promise<void>;
    checkOrderApi(params: OrderRedis): Promise<boolean>;
    requestApi(uid: string, cookies: string, ctoken: string, name: string, id: number, accountType?: number): Promise<boolean | Array<any>>;
    checkOrderBySql(orderRedis: OrderRedis): Promise<boolean>;
    notifyRequest(url: any, notify: any, yan: string, time?: number, times?: number): Promise<void>;
    retry(fn: any, times: any, url: any, form: any, time: any): Promise<unknown>;
    reqCallback(url: string, form: any): Promise<unknown>;
    test(): Promise<unknown>;
    autoCallback(params: ALiPayNotify, p: PayAccount): Promise<any>;
}
