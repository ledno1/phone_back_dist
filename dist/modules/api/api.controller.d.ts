import { OnModuleInit } from "@nestjs/common";
import { Request } from 'express';
import { ApiService } from "@/modules/api/api.service";
import { SysParamConfigService } from "@/modules/admin/system/param-config/param-config.service";
import { ChannelService } from "@/modules/resource/channel/channel.service";
import { RedisService } from "@/shared/services/redis.service";
import { DirectBack, DirectPush, Pay, PayCheck, PayResponse } from "@/modules/api/APIInterFace/interface";
import { IAdminUser } from "@/modules/admin/admin.interface";
import { UtilService } from "@/shared/services/util.service";
export declare class ApiController implements OnModuleInit {
    private readonly apiService;
    private paramConfigService;
    private readonly channelService;
    private redis;
    private utils;
    constructor(apiService: ApiService, paramConfigService: SysParamConfigService, channelService: ChannelService, redis: RedisService, utils: UtilService);
    onModuleInit(): Promise<void>;
    pay(body: Pay): Promise<string | 1 | PayResponse>;
    payTest(body: any, user: IAdminUser): Promise<string | 1 | PayResponse>;
    payCheck(body: PayCheck): Promise<{
        merId: any;
        orderId: any;
        status: string;
        sysOrderId: string;
        orderAmt: string;
        nonceStr: string;
    }>;
    getpayurl(body: any, request: Request): Promise<({
        code: number;
    } & {
        outTime: any;
    }) | {
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
        url?: undefined;
        qrcode?: undefined;
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
        oid?: undefined;
        phone?: undefined;
        outTime?: undefined;
        url?: undefined;
        qrcode?: undefined;
        mode?: undefined;
        mOid?: undefined;
    } | {
        code: number;
    }>;
    alipayNotify(body: any, query: any): Promise<"success" | "fail">;
    startcheck(query: any): Promise<void>;
    callback(): Promise<string>;
    directPush(body: DirectPush, request: Request): Promise<{
        code: number;
        message: string;
    }>;
    directBack(body: DirectBack, request: Request): Promise<{
        code: number;
        message: string;
    }>;
    callOrder(query: any, request: Request): Promise<string>;
}
