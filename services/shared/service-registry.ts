export interface ServiceConfig {
  name: string;
  url: string;
  port: number;
  timeout: number;
  retries: number;
  healthCheckPath: string;
  status?: 'up' | 'down' | 'unknown';
  lastHealthCheck?: Date;
}

export interface RegistryConfig {
  [serviceName: string]: ServiceConfig;
}

class ServiceRegistry {
  private registry: RegistryConfig = {};
  private healthCheckInterval: NodeJS.Timeout | null = null;

  public register(serviceName: string, config: ServiceConfig): void {
    this.registry[serviceName] = {
      ...config,
      status: 'unknown'
    };
    console.log(`[Registry] Service registered: ${serviceName} at ${config.url}`);
  }

  public getService(serviceName: string): ServiceConfig | null {
    return this.registry[serviceName] || null;
  }

  public getServiceUrl(serviceName: string): string | null {
    const service = this.getService(serviceName);
    return service?.url || null;
  }

  public getAllServices(): RegistryConfig {
    return this.registry;
  }

  public async checkHealth(serviceName: string): Promise<boolean> {
    const service = this.getService(serviceName);
    if (!service) {
      console.warn(`[Registry] Service not found: ${serviceName}`);
      return false;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), service.timeout);

    try {
      const response = await fetch(
        `${service.url}${service.healthCheckPath}`,
        {
          signal: controller.signal
        }
      );

      clearTimeout(timeout);

      const isHealthy = response.ok;
      service.status = isHealthy ? 'up' : 'down';
      service.lastHealthCheck = new Date();

      return isHealthy;
    } catch (error) {
      clearTimeout(timeout);

      service.status = 'down';
      service.lastHealthCheck = new Date();

      console.warn(
        `[Registry] Health check failed for ${serviceName}:`,
        (error as Error).message
      );

      return false;
    }
  }

  public async checkAllHealth(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const serviceName of Object.keys(this.registry)) {
      results[serviceName] = await this.checkHealth(serviceName);
    }

    return results;
  }

  public startHealthChecks(intervalMs: number = 30000): void {
    if (this.healthCheckInterval) {
      console.warn('[Registry] Health checks already running');
      return;
    }

    console.log(`[Registry] Starting health checks every ${intervalMs}ms`);

    this.healthCheckInterval = setInterval(async () => {
      await this.checkAllHealth();
    }, intervalMs);
  }

  public stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      console.log('[Registry] Health checks stopped');
    }
  }

  public getStatus(): Record<string, string> {
    const status: Record<string, string> = {};

    for (const [name, service] of Object.entries(this.registry)) {
      status[name] = service.status || 'unknown';
    }

    return status;
  }
}

export const serviceRegistry = new ServiceRegistry();

export const initializeServiceRegistry = (): void => {
  const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:5001';
  const todoServiceUrl = process.env.TODO_SERVICE_URL || 'http://localhost:5002';
  const notificationServiceUrl =
    process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5003';

  serviceRegistry.register('user-service', {
    name: 'user-service',
    url: userServiceUrl,
    port: parseInt(process.env.USER_SERVICE_PORT || '5001'),
    timeout: 5000,
    retries: 3,
    healthCheckPath: '/health'
  });

  serviceRegistry.register('todo-service', {
    name: 'todo-service',
    url: todoServiceUrl,
    port: parseInt(process.env.TODO_SERVICE_PORT || '5002'),
    timeout: 5000,
    retries: 3,
    healthCheckPath: '/health'
  });

  serviceRegistry.register('notification-service', {
    name: 'notification-service',
    url: notificationServiceUrl,
    port: parseInt(process.env.NOTIFICATION_SERVICE_PORT || '5003'),
    timeout: 5000,
    retries: 3,
    healthCheckPath: '/health'
  });

  console.log('[Registry] Service registry initialized with default services');
};