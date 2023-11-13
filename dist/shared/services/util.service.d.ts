import { HttpService } from "@nestjs/axios";
import { FastifyRequest } from "fastify";
import { Notify, NotifyResult } from "@/modules/resource/link/dto/dto";
import { EntityManager } from "typeorm";
export declare class UtilService {
    private readonly httpService;
    private entityManager;
    constructor(httpService: HttpService, entityManager: EntityManager);
    sleep(ms?: number): Promise<unknown>;
    getReqIP(req: FastifyRequest): string;
    IsLAN(ip: string): boolean;
    getLocation(ip: string): Promise<any>;
    aesEncrypt(msg: string, secret: string): string;
    aesDecrypt(encrypted: string, secret: string): string;
    md5(msg: string): string;
    generateUUID(): string;
    generateUUIDSelf(): string;
    generateRandomValue(length: number, placeholder?: string): string;
    getNowTimestamp(): any;
    dayjs(t?: any): any;
    dayjsFormat(t: any): any;
    unique(arr: any[], key: string): any[];
    ascesign(obj: any, yan: string): string;
    ascesign_chaoneng(obj: any, yan: string): string;
    checkSign_chaoneng(obj: any, yan: string): boolean;
    requestGet(url: string, headers?: {
        "Content-Type": string;
    }, timeout?: number): Promise<any>;
    requestPost(url: string, params: any, headers?: {
        "Content-Type": string;
    }, proxy?: any, timeout?: number): Promise<any>;
    checkSign(obj: any, yan: string): boolean;
    createSeedSecret: (userName: any, appName?: string) => Promise<{
        secret: string;
        qrcodeUrl: string;
    }>;
    isCodeCorrect: (code: any, secret: any) => boolean;
    notifyRequest(url: any, notify: Notify, yan: string): Promise<NotifyResult>;
    backClient(ip: string, fingerprint: string): Promise<boolean>;
}
