import { OnModuleInit } from "@nestjs/common";
import { RedisService } from "@/shared/services/redis.service";
import { UtilService } from "@/shared/services/util.service";
import { TopService } from "@/modules/usersys/top/top.service";
import { LinkService } from "@/modules/resource/link/link.service";
import { SysParamConfigService } from "@/modules/admin/system/param-config/param-config.service";
import { EntityManager } from "typeorm";
import { ZhService } from "@/modules/resource/zh/zh.service";
import { ProxyService } from "@/modules/usersys/proxy/proxy.service";
import { Queue } from "bull";
import { OrderTopService } from "@/modules/api/top/orderTop.service";
import { ChannelService } from "@/modules/resource/channel/channel.service";
import { ProxyChargingService } from "@/modules/resource/proxyCharging/proxyChargin.service";
import { ALiPayNotify, DirectBack, DirectPush, Pay, SysPay } from "@/modules/api/APIInterFace/interface";
import { HandlerTemplateService } from "@/modules/api/subHandler/handlerTemplate.service";
import { ALiPayHandlerService } from "@/modules/api/subHandler/aLiPayHandler.service";
import { IAdminUser } from "@/modules/admin/admin.interface";
import { XiaoMangProxyChargingHandlerService } from "@/modules/api/subHandler/XiaoMangProxyChargingHandlerservice";
import { CheckModePhoneProxyChargingHandlerService } from "@/modules/api/subHandler/checkModePhoneProxyChargingHandlerservice";
import { PayCodePhoneChargingHandlerService } from "@/modules/api/subHandler/payCodePhoneChargingHandler.service";
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
    private proxyChargingService;
    private aLiPayHandlerService;
    private handlerTemplateService;
    xiaoMangHandlerService: XiaoMangProxyChargingHandlerService;
    checkModePhoneHandlerService: CheckModePhoneProxyChargingHandlerService;
    payCodePhoneChargingHandlerService: PayCodePhoneChargingHandlerService;
    private entityManager;
    private orderQueue;
    private host;
    private QQPAYCHANNEL;
    private WXPAYCHANNEL;
    private ALIAYCHANNEL;
    private handlerMap;
    constructor(redisService: RedisService, util: UtilService, topUserService: TopService, proxyUserService: ProxyService, linkService: LinkService, topOrderService: OrderTopService, zhService: ZhService, paramConfigService: SysParamConfigService, channelService: ChannelService, proxyChargingService: ProxyChargingService, aLiPayHandlerService: ALiPayHandlerService, handlerTemplateService: HandlerTemplateService, xiaoMangHandlerService: XiaoMangProxyChargingHandlerService, checkModePhoneHandlerService: CheckModePhoneProxyChargingHandlerService, payCodePhoneChargingHandlerService: PayCodePhoneChargingHandlerService, entityManager: EntityManager, orderQueue: Queue);
    private appHost;
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
    payCheck(body: any): Promise<{
        merId: any;
        orderId: any;
        status: string;
        sysOrderId: string;
        orderAmt: string;
        nonceStr: string;
    }>;
    getPayUrl(params: any, ip: string): Promise<({
        code: number;
    } & {
        outTime: any;
    }) | {
        code: number;
        price?: undefined;
        orderid?: undefined;
        userid?: undefined;
        createAt?: undefined;
        showOrderid?: undefined;
        status?: undefined;
        oid?: undefined;
        msg?: undefined;
        phone?: undefined;
        outTime?: undefined;
        jump_url?: undefined;
        mOid?: undefined;
        url?: undefined;
        qrcode?: undefined;
        mode?: undefined;
    } | {
        code: number;
        price: string;
        orderid: string;
        userid: string;
        createAt: string | Date;
        showOrderid: string;
        status: boolean;
        oid: string;
        msg?: undefined;
        phone?: undefined;
        outTime?: undefined;
        jump_url?: undefined;
        mOid?: undefined;
        url?: undefined;
        qrcode?: undefined;
        mode?: undefined;
    } | {
        code: number;
        msg: string;
        price?: undefined;
        orderid?: undefined;
        userid?: undefined;
        createAt?: undefined;
        showOrderid?: undefined;
        status?: undefined;
        oid?: undefined;
        phone?: undefined;
        outTime?: undefined;
        jump_url?: undefined;
        mOid?: undefined;
        url?: undefined;
        qrcode?: undefined;
        mode?: undefined;
    } | {
        code: number;
        phone: string;
        outTime: any;
        price?: undefined;
        orderid?: undefined;
        userid?: undefined;
        createAt?: undefined;
        showOrderid?: undefined;
        status?: undefined;
        oid?: undefined;
        msg?: undefined;
        jump_url?: undefined;
        mOid?: undefined;
        url?: undefined;
        qrcode?: undefined;
        mode?: undefined;
    } | {
        code: number;
        msg: string;
        jump_url: any;
        outTime: any;
        mOid: string;
        price?: undefined;
        orderid?: undefined;
        userid?: undefined;
        createAt?: undefined;
        showOrderid?: undefined;
        status?: undefined;
        oid?: undefined;
        phone?: undefined;
        url?: undefined;
        qrcode?: undefined;
        mode?: undefined;
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
        oid?: undefined;
        phone?: undefined;
        jump_url?: undefined;
    }>;
    alipayNotify(params: ALiPayNotify, query: any): Promise<"success" | "fail">;
    callBack(params: any): Promise<void>;
    callOrder(params: any, cookies: string): Promise<string>;
    directPush(params: DirectPush): Promise<{
        code: number;
        message: string;
    }>;
    directBack(params: DirectBack): Promise<{
        code: number;
        message: string;
    }>;
    isIpWhitelisted(ip: string, merId: string): Promise<boolean>;
    private sid;
    test(params: any): Promise<void>;
}
