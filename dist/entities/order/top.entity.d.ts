import { BaseEntity } from "@/entities/base.entity";
import { ZH } from "@/entities/resource/zh.entity";
import SysUser from "@/entities/admin/sys-user.entity";
export declare class TopOrder extends BaseEntity {
    id: number;
    amount: number;
    mid: number;
    status: number;
    errInfo: string;
    pid: number;
    oid: string;
    mOid: string;
    mIp: string;
    mNotifyUrl: string;
    callbackInfo: string;
    callback: number;
    channel: number;
    parentChannel: number;
    lOid: string;
    queryUrl: string;
    APIKey: string;
    lRate: number;
    zh: ZH;
    SysUser: SysUser;
}
