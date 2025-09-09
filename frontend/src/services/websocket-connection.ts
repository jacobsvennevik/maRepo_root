/**
 * Shared WebSocket connection utilities.
 * Eliminates duplication across multiple hooks.
 */
import { webSocketService } from '@/services/websocket';

export interface ConnectionStatus {
  isConnected: boolean;
  lastChecked: Date;
}

export class WebSocketConnectionManager {
  private static instance: WebSocketConnectionManager;
  private connectionStatus: ConnectionStatus = {
    isConnected: false,
    lastChecked: new Date()
  };
  private listeners: Set<(status: ConnectionStatus) => void> = new Set();
  private checkInterval: NodeJS.Timeout | null = null;

  static getInstance(): WebSocketConnectionManager {
    if (!WebSocketConnectionManager.instance) {
      WebSocketConnectionManager.instance = new WebSocketConnectionManager();
    }
    return WebSocketConnectionManager.instance;
  }

  private constructor() {
    this.startConnectionMonitoring();
  }

  private startConnectionMonitoring(): void {
    this.checkInterval = setInterval(() => {
      this.updateConnectionStatus();
    }, 1000);
  }

  private updateConnectionStatus(): void {
    const isConnected = webSocketService.isConnected();
    const lastChecked = new Date();
    
    if (this.connectionStatus.isConnected !== isConnected) {
      this.connectionStatus = { isConnected, lastChecked };
      this.notifyListeners();
    } else {
      this.connectionStatus.lastChecked = lastChecked;
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener(this.connectionStatus);
    });
  }

  public subscribe(listener: (status: ConnectionStatus) => void): () => void {
    this.listeners.add(listener);
    
    // Immediately call with current status
    listener(this.connectionStatus);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  public destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.listeners.clear();
  }
}

// Singleton instance
export const connectionManager = WebSocketConnectionManager.getInstance();
