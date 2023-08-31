import { OnModuleInit } from "@nestjs/common";
import { NewtestService } from './newtest.service';
import { ClientProxy } from "@nestjs/microservices";
import { Observable } from "rxjs";
export declare class NewtestController implements OnModuleInit {
    private readonly newtestService;
    private readonly client;
    private alipaySdk;
    private appId;
    constructor(newtestService: NewtestService, client: ClientProxy);
    onModuleInit(): void;
    findOne(dto: any): Promise<any>;
    private upfile;
    testMicroservice(): Promise<Observable<number>>;
}
