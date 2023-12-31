import { BaseEntity } from '../base.entity';
import { ZH } from "@/entities/resource/zh.entity";
import { Link } from "@/entities/resource/link.entity";
import { Group } from "@/entities/resource/group.entity";
import { TopOrder } from "@/entities/order/top.entity";
import { PayAccount } from "@/entities/resource/payaccount.entity";
export default class SysUser extends BaseEntity {
    id: number;
    departmentId: number;
    name: string;
    username: string;
    password: string;
    psalt: string;
    nickName: string;
    headImg: string;
    email: string;
    phone: string;
    remark: string;
    whiteIP: string;
    status: number;
    googleSecret: string;
    uuid: string;
    parent: SysUser;
    children: SysUser[];
    zh: ZH[];
    pay_account: PayAccount[];
    link: Link[];
    group: Group[];
    topOrder: TopOrder[];
    balance: number;
    lv: number;
    selfOpen: boolean;
    parentOpen: boolean;
    parentRate: number;
    rate: number;
    payAccountMode: number;
    md5key: string;
}
