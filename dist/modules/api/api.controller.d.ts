import { ApiService } from "@/modules/api/api.service";
import { SysParamConfigService } from "@/modules/admin/system/param-config/param-config.service";
import { ChannelService } from "@/modules/resource/channel/channel.service";
import { RedisService } from "@/shared/services/redis.service";
import { Pay, PayCheck, PayResponse } from "@/modules/api/APIInterFace/interface";
import { IAdminUser } from "@/modules/admin/admin.interface";
export declare class ApiController {
    private readonly apiService;
    private paramConfigService;
    private readonly channelService;
    private redis;
    constructor(apiService: ApiService, paramConfigService: SysParamConfigService, channelService: ChannelService, redis: RedisService);
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
    getpayurl(body: any): Promise<{
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
    } | {
        code: number;
        msg: string;
        url: any;
        qrcode: any;
        outTime: any;
        price?: undefined;
        orderid?: undefined;
        userid?: undefined;
        createAt?: undefined;
        showOrderid?: undefined;
        status?: undefined;
    }>;
}
