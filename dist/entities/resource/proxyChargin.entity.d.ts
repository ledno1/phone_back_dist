import { BaseEntity } from "@/entities/base.entity";
import SysUser from "@/entities/admin/sys-user.entity";
export declare class ProxyCharging extends BaseEntity {
    id: number;
    target: string;
    amount: number;
    pid: number;
    status: number;
    codeCount: number;
    createStatus: boolean;
    errInfo: string;
    pUid: string;
    oid: string;
    mOid: string;
    version: number;
    weight: number;
    lock: boolean;
    count: number;
    isClose: boolean;
    outTime: Date;
    operator: string;
    callback: number;
    channel: number;
    parentChannel: number;
    lRate: number;
    SysUser: SysUser;
}
