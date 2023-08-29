import { OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { Hero } from './interfaces/hero.interface';
export declare class HeroController implements OnModuleInit {
    private readonly client;
    private heroService;
    constructor(client: ClientGrpc);
    onModuleInit(): void;
    getMany(): Observable<Hero[]>;
    getById(id: string): Observable<Hero>;
}
