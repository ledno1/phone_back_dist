import { ProxyChargingService } from './proxyChargin.service';
import { IAdminUser } from "@/modules/admin/admin.interface";
export declare class ProxyChargingController {
    private readonly channelService;
    constructor(channelService: ProxyChargingService);
    page(query: any, user: IAdminUser): Promise<{
        label: string;
        value: string;
    }[] | {
        list: any[];
        pagination: {
            total: number;
            page: number;
            size: number;
        };
    }>;
    add(body: any, user: IAdminUser): Promise<string>;
    edit(body: any, user: IAdminUser): Promise<string>;
}
