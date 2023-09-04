import { OnModuleInit } from "@nestjs/common";
import { PayCodeService } from './payCode.service';
import { ClientProxy } from "@nestjs/microservices";
export declare class NewtestController implements OnModuleInit {
    private readonly newtestService;
    private readonly client;
    constructor(newtestService: PayCodeService, client: ClientProxy);
    onModuleInit(): void;
}
