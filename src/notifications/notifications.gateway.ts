import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class NotificationsGateway implements OnGatewayInit, OnGatewayConnection {
    @WebSocketServer()
    server: Server;

    constructor(private readonly jwtService: JwtService) {}

    afterInit() {
        // noop
    }

    async handleConnection(client: Socket) {
        const token =
            (client.handshake.auth?.token as string | undefined) ||
            (client.handshake.headers['authorization'] as string | undefined)?.replace(
                'Bearer ',
                '',
            );

        if (!token) {
            client.disconnect();
            return;
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_ACCESS_SECRET,
            });
            const userId = String(payload.sub);
            client.join(`user:${userId}`);
        } catch {
            client.disconnect();
        }
    }

    // Example manual push (if needed)
    @SubscribeMessage('ping')
    handlePing(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
        client.emit('pong', data);
    }

    emitToUser(userId: string, event: string, data: any) {
        this.server.to(`user:${userId}`).emit(event, data);
    }
}
