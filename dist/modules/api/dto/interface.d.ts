import { ProxyCharging } from "@/entities/resource/proxyChargin.entity";
export declare class LinkObject {
    amount: number;
    channel: number;
    parentChannel: number;
    nowUuid?: any;
    merId?: string;
    oid?: string;
}
export declare class PhoneOrder {
    proxyChargingInfo: ProxyCharging;
    user: string;
}
export declare class LinkObj {
    link: string;
    APIOrderId: string;
    amount: number | string;
    oid?: string;
    queryUrl?: string;
}
