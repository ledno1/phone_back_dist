import { OnModuleInit } from "@nestjs/common";
import { PayCodeProxyService } from "@/modules/payCode/proxy/proxy.service";
export declare class PayCodeProxyController implements OnModuleInit {
    private readonly proxyService;
    constructor(proxyService: PayCodeProxyService);
    onModuleInit(): void;
    payCheck(body: any): Promise<string>;
}
