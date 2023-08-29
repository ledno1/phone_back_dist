import { BaseEntity } from "@/entities/base.entity";
import SysUser from "@/entities/admin/sys-user.entity";
import { Link } from "@/entities/resource/link.entity";
import { Group } from "@/entities/resource/group.entity";
import { TopOrder } from "@/entities/order/top.entity";
export declare class ZH extends BaseEntity {
    id: number;
    accountNumber: string;
    cookie: string;
    balance: number;
    balanceLock: number;
    rechargeLimit: number;
    lockLimit: number;
    totalRecharge: number;
    open: boolean;
    reuse: boolean;
    zuid: string;
    openid: string;
    openkey: string;
    weight: number;
    SysUser: SysUser;
    link: Link[];
    group: Group[];
    topOrder: TopOrder[];
}
