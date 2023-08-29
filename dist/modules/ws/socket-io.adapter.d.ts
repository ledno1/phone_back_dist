import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class SocketIoAdapter extends IoAdapter {
    private app;
    private configService;
    constructor(app: INestApplicationContext, configService: ConfigService);
    create(port: number, options?: any): import("socket.io").Server<import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, any>;
    createIOServer(port: number, options?: any): any;
}
