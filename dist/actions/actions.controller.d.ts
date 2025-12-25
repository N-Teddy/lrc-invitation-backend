import { ActionsService } from './actions.service';
export declare class ActionsController {
    private readonly actionsService;
    constructor(actionsService: ActionsService);
    handle(token: string): Promise<string>;
}
