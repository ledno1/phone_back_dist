import { ALiPayNotify, PayResponse, SysPay } from "@/modules/api/APIInterFace/interface";
import { PayAccount } from "@/entities/resource/payaccount.entity";
import { ProxyCharging } from "@/entities/resource/proxyChargin.entity";
import { TopOrder } from "@/entities/order/top.entity";
import { IAdminUser } from "@/modules/admin/admin.interface";
import { CodeService } from "@/modules/code/code/code.service";
export declare enum ChannelType {
    PROXY = "proxy",
    DIRECT = "direct"
}
export declare enum ProcessModel {
    SERVICE = "service",
    CHECK = "check"
}
export declare enum PayMode {
    aLiPayCheckMode = "aLiPayCheckMode"
}
export declare class HaveAmount {
    username: string;
    id: number;
    uuid: string;
    count?: number | string;
    rate?: number | string;
}
export declare class PayAccountAndMerchant {
    payAccount: PayAccount | PayAccountEx;
    merchant: HaveAmount;
}
export declare class ProxyChargingAndMerchant {
    proxyCharging: ProxyCharging;
    merchant: HaveAmount;
}
export declare class PayAccountEx extends PayAccount {
    realAmount?: number;
}
export declare class OrderRedis {
    createAt: string | Date;
    req: SysPay;
    order: TopOrder;
    resource: PayAccountEx | PayAccount | ProxyCharging | null;
    user: HaveAmount | null;
    showOrder?: string;
    realAmount?: number;
    phoneBalance?: string;
}
export interface ServiceHandler {
    codeService: CodeService;
    nameKey: string | string[];
    channelType: ChannelType;
    redisOrderName: string;
    model: ProcessModel;
    defaultSystemOutTime: number;
    host: string;
    result(params: SysPay, user: IAdminUser): Promise<PayResponse | string>;
    haveAmount(params: SysPay): Promise<HaveAmount[]>;
    findMerchant(params: SysPay, h: HaveAmount[], oid: string): Promise<ProxyChargingAndMerchant | PayAccountAndMerchant | null>;
    findProxyChargingAndUpdate(params: SysPay, user: HaveAmount, oid: string): Promise<ProxyCharging>;
    findPayAccountAndUpdate(params: SysPay, user: HaveAmount, oid: string): Promise<PayAccount | PayAccountEx>;
    updateMerchant(params: SysPay, user: HaveAmount): Promise<void>;
    getApiUrl(params: SysPay): Promise<void>;
    createOrder(params: SysPay, account: PayAccountAndMerchant | ProxyChargingAndMerchant, oid: string): Promise<void>;
    rollback(params: SysPay, resource: PayAccount | ProxyCharging | null, user: HaveAmount | null, oid: string): Promise<void>;
    outTime(params: OrderRedis): Promise<void>;
    checkOrder(params: SysPay): Promise<void>;
    checkOrderApi(params: OrderRedis): Promise<boolean>;
    checkOrderBySql(params: OrderRedis): Promise<boolean>;
    test(): any;
    autoCallback(params: ALiPayNotify, p: PayAccount): Promise<any>;
}
