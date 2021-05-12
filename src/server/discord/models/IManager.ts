export abstract class BaseManager {
    
    abstract init(): void | Promise<void>;
    abstract stop(): void | Promise<void>;
}