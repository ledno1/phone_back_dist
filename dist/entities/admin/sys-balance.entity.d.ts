import { BaseEntity } from "@/entities/base.entity";
export declare enum TypeEnum {
    ADD = "ADD",
    REDUCE = "REDUCE"
}
export declare enum EventEnum {
    recharge = "recharge",
    deduction = "deduction",
    commission = "commission",
    topOrder = "topOrder",
    topOrderRe = "topOrderRe",
    rechargeSub = "rechargeSub"
}
export declare class SysBalanceLog extends BaseEntity {
    id: number;
    uuid: string;
    typeEnum: string;
    amount: number;
    event: string;
    actionUuid: string;
    orderUuid: string;
    balance: number;
}
