import { BaseEntity } from "@/entities/base.entity";
export declare class TakeLink extends BaseEntity {
    id: number;
    name: string;
    url: string;
    isUse: boolean;
    weight: number;
    key: string;
    token: string;
    getCount: number;
    successRate: number;
}
