import { BaseEntity } from "@/entities/base.entity";
import SysUser from "@/entities/admin/sys-user.entity";
export declare class PayAccountAppid extends BaseEntity {
    id: number;
    name: string;
    appId: string;
    privateKey: string;
    mark: string;
    rechargeLimit: number;
    lockLimit: number;
    totalRecharge: number;
    open: boolean;
    weight: number;
    SysUser: SysUser;
}
