import { OnModuleInit } from "@nestjs/common";
import { PayCodeAccountService } from "@/modules/payCode/account/proxy.service";
export declare class PayCodeAccountController implements OnModuleInit {
    private readonly proxyService;
    constructor(proxyService: PayCodeAccountService);
    onModuleInit(): void;
}
