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
export declare class OrderTopService {
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
    notifyRequest(url: any, notify: Notify, yan: string): Promise<NotifyResult>;
    page(params: any, user: IAdminUser): Promise<{
        totalAmount: any;
        list: any[];
        pagination: {
            total: number;
            page: number;
            size: number;
        };
    }>;
    pageByAdmin(params: any, user: IAdminUser): Promise<{
        totalAmount: any;
        list: any[];
        pagination: {
            total: number;
            page: number;
            size: number;
        };
    }>;
    pageByProxy(params: any, user: IAdminUser): Promise<{
        totalAmount: any;
        list: any[];
        pagination: {
            total: number;
            page: number;
            size: number;
        };
    }>;
    pageByTop(params: any, user: IAdminUser): Promise<{
        totalAmount: any;
        list: any[];
        pagination: {
            total: number;
            page: number;
            size: number;
        };
    }>;
    pageByMa(params: any, user: IAdminUser): Promise<{
        totalAmount: any;
        list: any[];
        pagination: {
            total: number;
            page: number;
            size: number;
        };
    }>;
    callback(params: any, user: IAdminUser): Promise<void>;
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
