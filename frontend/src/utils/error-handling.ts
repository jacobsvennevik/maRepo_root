/**
 * Shared error handling utilities for GraphQL operations.
 * Eliminates duplication in error handling patterns.
 */
import { AuthService } from '@/app/(auth)/services/auth';

export interface GraphQLError {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: Array<string | number>;
}

export interface NetworkError {
  statusCode?: number;
  message: string;
}

export class ErrorHandler {
  /**
   * Handle GraphQL errors
   */
  static handleGraphQLErrors(errors: GraphQLError[]): void {
    errors.forEach(({ message, locations, path }) => {
      console.error(
        `GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  /**
   * Handle network errors
   */
  static handleNetworkError(error: NetworkError): void {
    console.error(`GraphQL network error: ${error.message}`);
    
    // Handle 401 errors by redirecting to login
    if (error.statusCode === 401) {
      AuthService.logout();
      window.location.href = '/login';
    }
  }

  /**
   * Handle general errors with fallback message
   */
  static handleError(error: unknown, fallbackMessage: string = 'An error occurred'): string {
    if (error instanceof Error) {
      console.error('Error:', error.message);
      return error.message;
    }
    
    console.error('Unknown error:', error);
    return fallbackMessage;
  }

  /**
   * Create standardized error response
   */
  static createErrorResponse(message: string, details?: any) {
    return {
      success: false,
      error: message,
      details: details || null
    };
  }
}

/**
 * Decorator for async functions to handle errors consistently
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorMessage: string = 'Operation failed'
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      const message = ErrorHandler.handleError(error, errorMessage);
      throw new Error(message);
    }
  }) as T;
}
