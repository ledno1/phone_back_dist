import { BaseEntity } from "@/entities/base.entity";
import SysUser from "@/entities/admin/sys-user.entity";
import { ZH } from "@/entities/resource/zh.entity";
export declare class Group extends BaseEntity {
    id: number;
    name: string;
    SysUser: SysUser;
    children: ZH[];
}
