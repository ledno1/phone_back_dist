import { BaseEntity } from "@/entities/base.entity";
import SysUser from "@/entities/admin/sys-user.entity";
export declare class PayAccount extends BaseEntity {
    id: number;
    name: string;
    _id: string;
    uid: string;
    cookies: string;
    mark: string;
    rechargeLimit: number;
    lockLimit: number;
    totalRecharge: number;
    payMode: number;
    accountType: number;
    open: boolean;
    status: boolean;
    weight: number;
    SysUser: SysUser;
}
