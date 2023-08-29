import { conf } from 'qiniu';
export interface IAdminUser {
    uid: number;
    pv: number;
    id: number;
    departmentId: number;
    name: string;
    username: string;
    nickName: string;
    headImg: string;
    email: string;
    phone: string;
    remark: string;
    status: number;
    roles: Array<number>;
    departmentName: string;
    roleLabel: string;
    lv: number;
    iat: number;
    uuid: string;
}
export type QINIU_ACCESS_CONTROL = 'private' | 'public';
export interface IQiniuConfig {
    accessKey: string;
    secretKey: string;
    bucket: string;
    zone: conf.Zone;
    domain: string;
    access: QINIU_ACCESS_CONTROL;
}
