import { OnModuleInit } from "@nestjs/common";
import { CodeService } from "@/modules/code/code/code.service";
export declare class CodeController implements OnModuleInit {
    private readonly payCodeService;
    constructor(payCodeService: CodeService);
    onModuleInit(): void;
}
