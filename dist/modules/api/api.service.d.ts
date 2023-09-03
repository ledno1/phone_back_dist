import { OnModuleInit } from "@nestjs/common";
import { RedisService } from "@/shared/services/redis.service";
import { UtilService } from "@/shared/services/util.service";
import { TopService } from "@/modules/usersys/top/top.service";
import { LinkService } from "@/modules/resource/link/link.service";
import { SysParamConfigService } from "@/modules/admin/system/param-config/param-config.service";
import { EntityManager } from "typeorm";
import { LinkObject } from "@/modules/api/dto/interface";
import { ZhService } from "@/modules/resource/zh/zh.service";
import { ProxyService } from "@/modules/usersys/proxy/proxy.service";
import { Queue } from "bull";
import { OrderTopService } from "@/modules/api/top/orderTop.service";
import { ChannelService } from "@/modules/resource/channel/channel.service";
import { ProxyChargingAPIService } from "@/modules/api/proxyChargingAPI.service";
import { ProxyChargingService } from "@/modules/resource/proxyCharging/proxyChargin.service";
import { WxChannelAPIService } from "@/modules/api/wxChannelAPI.service";
import { ALiPayNotify, Pay, SysPay } from "@/modules/api/APIInterFace/interface";
import { HandlerTemplateService } from "@/modules/api/subHandler/handlerTemplate.service";
import { ALiPayHandlerService } from "@/modules/api/subHandler/aLiPayHandler.service";
import { IAdminUser } from "@/modules/admin/admin.interface";
import { XiaoMangProxyChargingHandlerservice } from "@/modules/api/subHandler/XiaoMangProxyChargingHandlerservice";
export declare class ApiService implements OnModuleInit {
    private redisService;
    private util;
    private topUserService;
    private proxyUserService;
    private linkService;
    private topOrderService;
    private zhService;
    private paramConfigService;
    private channelService;
    private proxyChargingAPI;
    private proxyChargingService;
    private wxChannelAPIService;
    private aLiPayHandlerService;
    private handlerTemplateService;
    private xiaoMangHandlerService;
    private entityManager;
    private orderQueue;
    private host;
    private QQPAYCHANNEL;
    private WXPAYCHANNEL;
    private ALIAYCHANNEL;
    private handlerMap;
    constructor(redisService: RedisService, util: UtilService, topUserService: TopService, proxyUserService: ProxyService, linkService: LinkService, topOrderService: OrderTopService, zhService: ZhService, paramConfigService: SysParamConfigService, channelService: ChannelService, proxyChargingAPI: ProxyChargingAPIService, proxyChargingService: ProxyChargingService, wxChannelAPIService: WxChannelAPIService, aLiPayHandlerService: ALiPayHandlerService, handlerTemplateService: HandlerTemplateService, xiaoMangHandlerService: XiaoMangProxyChargingHandlerservice, entityManager: EntityManager, orderQueue: Queue);
    onModuleInit(): Promise<void>;
    payMd5(body: Pay, user?: IAdminUser): Promise<string | import("@/modules/api/APIInterFace/interface").PayResponse>;
    payByALI(body: SysPay, user?: IAdminUser): Promise<string | import("@/modules/api/APIInterFace/interface").PayResponse>;
    payByWX(body: Pay): Promise<{
        code: number;
        payurl: string;
        sysorderno: string;
        orderno: string;
    }>;
    payByQQ(body: Pay): Promise<{
        code: number;
        payurl: string;
        sysorderno: string;
        orderno: string;
    }>;
    getInstant(): Promise<void>;
    getLinkByStrategy(linkObject: LinkObject, t?: number): Promise<{
        link: any;
        zh: any;
        user: any;
    }>;
    defaultStrategy(linkObject: LinkObject): Promise<{
        link: any;
        zh: any;
        user: any;
    }>;
    queueByUserZh(linkObject: LinkObject): Promise<false | {
        link: any;
        zh: any;
    }>;
    payCheck(body: any): Promise<{
        merId: any;
        orderId: any;
        status: string;
        sysOrderId: string;
        orderAmt: string;
        nonceStr: string;
    }>;
    getPayUrl(params: any, reqs: any): Promise<{
        code: number;
        price?: undefined;
        orderid?: undefined;
        userid?: undefined;
        createAt?: undefined;
        showOrderid?: undefined;
        status?: undefined;
        msg?: undefined;
        url?: undefined;
        qrcode?: undefined;
        outTime?: undefined;
        mode?: undefined;
        mOid?: undefined;
    } | {
        code: number;
        price: string;
        orderid: string;
        userid: string;
        createAt: string;
        showOrderid: string;
        status: boolean;
        msg?: undefined;
        url?: undefined;
        qrcode?: undefined;
        outTime?: undefined;
        mode?: undefined;
        mOid?: undefined;
    } | {
        code: number;
        msg: string;
        price?: undefined;
        orderid?: undefined;
        userid?: undefined;
        createAt?: undefined;
        showOrderid?: undefined;
        status?: undefined;
        url?: undefined;
        qrcode?: undefined;
        outTime?: undefined;
        mode?: undefined;
        mOid?: undefined;
    } | {
        code: number;
        msg: string;
        url: any;
        qrcode: any;
        outTime: any;
        mode: string;
        mOid: string;
        price?: undefined;
        orderid?: undefined;
        userid?: undefined;
        createAt?: undefined;
        showOrderid?: undefined;
        status?: undefined;
    }>;
    alipayNotify(params: ALiPayNotify, query: any): Promise<"success" | "fail">;
    private sid;
    test(params: any): Promise<void>;
}
