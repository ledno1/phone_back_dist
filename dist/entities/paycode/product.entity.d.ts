import { BaseEntity } from "@/entities/base.entity";
export declare class PayCodeProduct extends BaseEntity {
    id: number;
    name: string;
    amountType: string;
    productType: string;
    rate: string;
    strategy: number;
    isPublic: boolean;
    isUse: boolean;
    weight: number;
    expireTime: number;
}
