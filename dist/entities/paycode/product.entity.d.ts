import { BaseEntity } from "@/entities/base.entity";
export declare class PayCodeProduct extends BaseEntity {
    id: number;
    name: string;
    amountType: string;
    rate: string;
    isPublic: boolean;
    open: boolean;
    weight: number;
    expireTime: number;
    maxStock: number;
    checkMode: number;
    payCallBackMode: number;
    proxyChargingCallBackMode: number;
    enable: boolean;
}
