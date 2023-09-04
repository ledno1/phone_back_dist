import { OnModuleInit } from "@nestjs/common";
import { PayCodeService } from "@/modules/paycode/paycode.service";
export declare class PayCodeController implements OnModuleInit {
    private readonly payCodeService;
    constructor(payCodeService: PayCodeService);
    onModuleInit(): void;
}
