import { OnGatewayInit, OnGatewayConnection } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
export declare class NotificationsGateway implements OnGatewayInit, OnGatewayConnection {
    private readonly jwtService;
    server: Server;
    constructor(jwtService: JwtService);
    afterInit(): void;
    handleConnection(client: Socket): Promise<void>;
    handlePing(data: any, client: Socket): void;
    emitToUser(userId: string, event: string, data: any): void;
}
