/**
 * WebSocket service for real-time study progress updates.
 */
import { AuthService } from '@/app/(auth)/services/auth';
import { WEBSOCKET_CONFIG } from '@/constants/design-tokens';

export interface StudyProgressUpdate {
  flashcard_id: string;
  rating: number;
  next_review?: string;
  progress_stats: {
    total_cards: number;
    reviewed_today: number;
    due_cards: number;
    study_streak: number;
    completion_rate: number;
  };
  timestamp?: string;
}

export interface ProjectUpdate {
  id: string;
  name: string;
  type: string;
  created_at: string;
}

export class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS;
  private reconnectDelay = WEBSOCKET_CONFIG.RECONNECT_DELAY;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Temporarily disable auto-connect until Django Channels is properly configured
    // this.connect();
  }

  private connect(): void {
    if (!AuthService.isAuthenticated()) {
      console.log('🔌 WebSocket: Not authenticated, skipping connection');
      return;
    }

    const token = AuthService.getAuthToken();
    if (!token) {
      console.log('🔌 WebSocket: No auth token available');
      return;
    }

    try {
      // Use Django Channels WebSocket endpoint
      const wsUrl = `ws://localhost:8000/ws/study-progress/`;
      this.socket = new WebSocket(wsUrl);

      this.setupEventHandlers();
      console.log('🔌 WebSocket: Connected successfully');
    } catch (error) {
      console.error('🔌 WebSocket: Connection failed:', error);
      this.handleReconnect();
    }
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.onopen = () => {
      console.log('🔌 WebSocket: Connected');
      this.reconnectAttempts = 0;
      
      // Send authentication token
      const token = AuthService.getAuthToken();
      if (token) {
        this.socket?.send(JSON.stringify({
          type: 'auth',
          token: token
        }));
      }
    };

    this.socket.onclose = (event) => {
      console.log('🔌 WebSocket: Disconnected:', event.code, event.reason);
      if (event.code !== 1000) { // Not a normal closure
        this.handleReconnect();
      }
    };

    this.socket.onerror = (error) => {
      console.error('🔌 WebSocket: Connection error:', error);
      this.handleReconnect();
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📊 WebSocket message received:', data);
        
        // Handle different message types
        switch (data.type) {
          case 'study_progress_update':
            this.dispatchCustomEvent('study-progress-update', data.data);
            break;
          case 'initial_stats':
            this.dispatchCustomEvent('initial-study-stats', data.data);
            break;
          case 'progress_update':
            this.dispatchCustomEvent('progress-update', data.data);
            break;
          case 'project_created':
            this.dispatchCustomEvent('project-created', data.data);
            break;
          case 'project_updated':
            this.dispatchCustomEvent('project-updated', data.data);
            break;
          case 'file_processing_update':
            this.dispatchCustomEvent('file-processing-update', data.data);
            break;
          case 'pong':
            console.log('🏓 WebSocket: Pong received');
            break;
          default:
            console.log('📊 Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('🔌 WebSocket: Error parsing message:', error);
      }
    };
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('🔌 WebSocket: Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔌 WebSocket: Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private dispatchCustomEvent(eventName: string, data: any): void {
    const event = new CustomEvent(eventName, { detail: data });
    window.dispatchEvent(event);
  }

  /**
   * Send flashcard review to server
   */
  public reviewFlashcard(flashcardId: string, rating: number): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('🔌 WebSocket: Not connected, cannot send review');
      return;
    }

    this.socket.send(JSON.stringify({
      type: 'flashcard_review',
      flashcard_id: flashcardId,
      rating: rating
    }));
  }

  /**
   * Request current study progress
   */
  public getStudyProgress(): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('🔌 WebSocket: Not connected, cannot get progress');
      return;
    }

    this.socket.send(JSON.stringify({
      type: 'get_progress'
    }));
  }

  /**
   * Ping server to check connection
   */
  public ping(): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('🔌 WebSocket: Not connected, cannot ping');
      return;
    }

    this.socket.send(JSON.stringify({
      type: 'ping'
    }));
  }

  /**
   * Disconnect WebSocket
   */
  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
      console.log('🔌 WebSocket: Disconnected');
    }
  }

  /**
   * Check if WebSocket is connected
   */
  public isConnected(): boolean {
    // Temporarily return false until Django Channels is properly configured
    return false;
  }

  /**
   * Reconnect WebSocket
   */
  public reconnect(): void {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect();
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();

// Export hook for React components
export function useWebSocket() {
  return webSocketService;
}
