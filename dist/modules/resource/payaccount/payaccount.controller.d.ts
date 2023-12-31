import { PayAccountService } from './payaccount.service';
import { IAdminUser } from "@/modules/admin/admin.interface";
export declare class PayAccountController {
    private readonly zhService;
    constructor(zhService: PayAccountService);
    findOne(query: any, user: IAdminUser): Promise<1 | {
        list: any;
        pagination: {
            total: any;
            page: number;
            size: number;
        };
    }>;
    del(body: any, user: IAdminUser): Promise<void>;
    add(body: any, user: IAdminUser): Promise<0 | 1 | {
        image: any;
        id: any;
        cookies?: undefined;
        uid?: undefined;
    } | {
        cookies: string;
        uid: any;
        image?: undefined;
        id?: undefined;
    } | {
        cookies: string;
        image?: undefined;
        id?: undefined;
        uid?: undefined;
    }>;
    edit(body: any, user: IAdminUser): Promise<1 | {
        code: number;
        msg: string;
        address?: undefined;
    } | {
        code: number;
        address: string;
        msg?: undefined;
    }>;
}
