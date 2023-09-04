import { OnModuleInit } from "@nestjs/common";
import { PayCodeService } from "@/modules/paycode/code/code.service";
export declare class CodeController implements OnModuleInit {
    private readonly payCodeService;
    constructor(payCodeService: PayCodeService);
    onModuleInit(): void;
}
