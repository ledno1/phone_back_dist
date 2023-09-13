import { OnModuleInit } from "@nestjs/common";
import { Request } from 'express';
import { ApiService } from "@/modules/api/api.service";
import { SysParamConfigService } from "@/modules/admin/system/param-config/param-config.service";
import { ChannelService } from "@/modules/resource/channel/channel.service";
import { RedisService } from "@/shared/services/redis.service";
import { DirectBack, DirectPush, Pay, PayCheck, PayResponse } from "@/modules/api/APIInterFace/interface";
import { IAdminUser } from "@/modules/admin/admin.interface";
export declare class ApiController implements OnModuleInit {
    private readonly apiService;
    private paramConfigService;
    private readonly channelService;
    private redis;
    constructor(apiService: ApiService, paramConfigService: SysParamConfigService, channelService: ChannelService, redis: RedisService);
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
        price?: undefined;
        orderid?: undefined;
        userid?: undefined;
        createAt?: undefined;
        showOrderid?: undefined;
        status?: undefined;
        msg?: undefined;
        phone?: undefined;
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
        createAt: string | Date;
        showOrderid: string;
        status: boolean;
        msg?: undefined;
        phone?: undefined;
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
        phone?: undefined;
        url?: undefined;
        qrcode?: undefined;
        outTime?: undefined;
        mode?: undefined;
        mOid?: undefined;
    } | {
        code: number;
        phone: string;
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
        phone?: undefined;
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
}
