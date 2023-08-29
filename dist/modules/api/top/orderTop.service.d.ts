import { OnModuleInit } from "@nestjs/common";
import { RedisService } from "@/shared/services/redis.service";
import { UtilService } from "@/shared/services/util.service";
import { ZhService } from "@/modules/resource/zh/zh.service";
import { LinkService } from "@/modules/resource/link/link.service";
import { EntityManager, Repository } from "typeorm";
import { TopOrder } from "@/entities/order/top.entity";
import { ProxyService } from "@/modules/usersys/proxy/proxy.service";
import { IAdminUser } from "@/modules/admin/admin.interface";
import { Notify, NotifyResult } from "@/modules/resource/link/dto/dto";
import { TopService } from "@/modules/usersys/top/top.service";
import { ProxyChargingService } from "@/modules/resource/proxyCharging/proxyChargin.service";
import { LinkObj } from "@/modules/api/dto/interface";
import { SysParamConfigService } from "@/modules/admin/system/param-config/param-config.service";
import { Queue } from "bull";
import { ProxyChargingUser } from "@/modules/api/proxyChargingAPI.service";
export declare class OrderTopService implements OnModuleInit {
    private redisService;
    private util;
    private zhService;
    private linkService;
    private proxyUserService;
    private topUserService;
    private proxyCharging;
    private paramConfigService;
    private entityManager;
    private orderRepository;
    private orderQueue;
    private defaultSystemOutTime;
    constructor(redisService: RedisService, util: UtilService, zhService: ZhService, linkService: LinkService, proxyUserService: ProxyService, topUserService: TopService, proxyCharging: ProxyChargingService, paramConfigService: SysParamConfigService, entityManager: EntityManager, orderRepository: Repository<TopOrder>, orderQueue: Queue);
    onModuleInit(): Promise<void>;
    notifyRequest(url: any, notify: Notify, yan: string): Promise<NotifyResult>;
    page(params: any, user: IAdminUser): Promise<{
        totalAmount: any;
        totalSuccessCount: any;
        totalCount: any;
        list: any[];
        pagination: {
            total: number;
            page: number;
            size: number;
        };
    }>;
    statistic(params: any): Promise<"日期格式不正确,例子:2020-01-01" | {
        查询时间: any;
        日期: any;
        成功总额: string;
        成功笔数: any;
        安卓成功率: string;
        苹果成功率: string;
        总笔数: any;
        总额: string;
        无法录入笔数: any;
        无法录入总额: string;
        合计总笔数: number;
        合计总额: string;
        失败总额: string;
        失败笔数: any;
        成功率: string;
    }>;
    pageByAdmin(params: any, user?: IAdminUser): Promise<{
        totalAmount: any;
        totalSuccessCount: any;
        totalCount: any;
        list: any[];
        pagination: {
            total: number;
            page: number;
            size: number;
        };
    }>;
    pageByProxy(params: any, user: IAdminUser): Promise<{
        totalAmount: any;
        totalSuccessCount: any;
        totalCount: any;
        list: any[];
        pagination: {
            total: number;
            page: number;
            size: number;
        };
    }>;
    pageByTop(params: any, user: IAdminUser): Promise<{
        totalAmount: any;
        totalSuccessCount: any;
        totalCount: any;
        list: any[];
        pagination: {
            total: number;
            page: number;
            size: number;
        };
    }>;
    pageByMa(params: any, user: IAdminUser): Promise<{
        totalAmount: any;
        totalSuccessCount: any;
        totalCount: any;
        list: any[];
        pagination: {
            total: number;
            page: number;
            size: number;
        };
    }>;
    statisticsTemp(params: any, user?: IAdminUser): Promise<{
        tempTotalAmount: any;
        tempTotalCount: any;
    }>;
    statistics(params: any, user?: IAdminUser): Promise<{
        totalFailCount: any;
        totalFailAmount: any;
        totalAmount: any;
        totalSuccessCount: any;
        totalCount: any;
    }>;
    callback(params: any, user: IAdminUser): Promise<NotifyResult>;
    orderOuTtime(job: any): Promise<void>;
    setOrderStatus(oid: string, status: number): Promise<void>;
    setOrderCallbackStatus(oid: string, callbackInfo: any): Promise<void>;
    setOrderNotifyStatus(oid: string, res: NotifyResult): Promise<void>;
    getOrderStatusByMOid(mOid: string): Promise<TopOrder>;
    getOrderInfoByMOid(mOid: string): Promise<false | TopOrder>;
    checkOrder(): Promise<void>;
    payCheck(mOid: any): Promise<TopOrder>;
    checkOrderApi(orderId: any, type?: number): Promise<boolean | {
        merId: number;
        status: string;
        orderId: string;
        sysOrderId: string;
        orderAmt: number;
        nonceStr: string;
    }>;
    checkOrderVXMDL(): Promise<void>;
    createOrderMDL(linkObj: LinkObj, body: any): Promise<LinkObj & {
        oid: string;
    }>;
    checkOrderApiMDL(orderId: any, type?: number): Promise<boolean | {
        merId: number;
        status: string;
        orderId: string;
        sysOrderId: string;
        orderAmt: number;
        nonceStr: string;
    }>;
    WXOrderOuTTime(job: any): Promise<void>;
    checkOrderPhone(): Promise<void>;
    checkOrderApiPhone(orderId: any, type?: number): Promise<boolean | {
        merId: number;
        status: string;
        orderId: string;
        sysOrderId: string;
        orderAmt: number;
        nonceStr: string;
    }>;
    createOrderMY(linkObj: LinkObj, body: any, proxyCharging: ProxyChargingUser, oid: any): Promise<LinkObj & {
        oid: string;
    }>;
    checkOrderApiMY(orderId: any, type?: number): Promise<boolean | {
        merId: number;
        status: string;
        orderId: string;
        sysOrderId: string;
        orderAmt: number;
        nonceStr: string;
    }>;
    createOrderKaKa(linkObj: LinkObj, body: any, proxyCharging: ProxyChargingUser, oid: any): Promise<LinkObj & {
        oid: string;
    }>;
    checkOrderApiKaKa(url: any): Promise<any>;
    phoneOrderOuTTime(job: any): Promise<void>;
}
