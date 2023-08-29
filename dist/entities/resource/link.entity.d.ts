import { BaseEntity } from "@/entities/base.entity";
import { ZH } from "@/entities/resource/zh.entity";
import SysUser from "@/entities/admin/sys-user.entity";
export declare class Link extends BaseEntity {
    id: number;
    amount: number;
    mid: number;
    url: string;
    paymentStatus: number;
    tid: string;
    createStatus: number;
    oid: string;
    lockTime: Date;
    channel: number;
    parentChannel: number;
    reuse: boolean;
    version: number;
    zh: ZH;
    SysUser: SysUser;
}
