import { OnModuleInit } from "@nestjs/common";
import { NewtestService } from './newtest.service';
import { ClientProxy } from "@nestjs/microservices";
export declare class NewtestController implements OnModuleInit {
    private readonly newtestService;
    private readonly client;
    constructor(newtestService: NewtestService, client: ClientProxy);
    onModuleInit(): void;
}
