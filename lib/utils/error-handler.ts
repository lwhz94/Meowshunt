import { ErrorType, AppError, createAppError, isAppError } from '@/lib/types/errors';

export interface ErrorHandlerOptions {
  logToConsole?: boolean;
  includeContext?: boolean;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  
  private constructor() {}
  
  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Process and handle errors consistently across the application
   */
  handleError(
    error: unknown,
    context?: Record<string, unknown>,
    options: ErrorHandlerOptions = {}
  ): AppError {
    const {
      logToConsole = true,
      includeContext = true
    } = options;

    // Convert to AppError if it isn't already
    let appError: AppError;
    
    if (isAppError(error)) {
      appError = error;
      // Add context if provided
      if (includeContext && context) {
        appError.context = { ...appError.context, ...context };
      }
    } else {
      // Try to determine error type from the error
      const errorType = this.determineErrorType(error);
      appError = createAppError(
        errorType,
        this.extractErrorMessage(error),
        includeContext ? context : undefined
      );
    }

    // Log to console if enabled
    if (logToConsole) {
      this.logError(appError);
    }

    return appError;
  }

  /**
   * Determine the appropriate error type based on the error content
   */
  private determineErrorType(error: unknown): ErrorType {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      // Authentication errors
      if (message.includes('not authenticated') || message.includes('unauthorized')) {
        return ErrorType.NOT_AUTHENTICATED;
      }
      
      // Permission errors
      if (message.includes('permission') || message.includes('forbidden')) {
        return ErrorType.INSUFFICIENT_PERMISSIONS;
      }
      
      // Network errors
      if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
        return ErrorType.NETWORK_ERROR;
      }
      
      // Validation errors
      if (message.includes('validation') || message.includes('invalid')) {
        return ErrorType.VALIDATION_ERROR;
      }
    }
    
    return ErrorType.UNKNOWN_ERROR;
  }

  /**
   * Extract a meaningful error message from various error types
   */
  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    if (typeof error === 'object' && error !== null) {
      // Try to find a message property
      if ('message' in error && typeof error.message === 'string') {
        return error.message;
      }
      
      // Try to find an error property
      if ('error' in error && typeof error.error === 'string') {
        return error.error;
      }
    }
    
    return 'An unexpected error occurred';
  }

  /**
   * Log errors to console with consistent formatting
   */
  private logError(error: AppError): void {
    const timestamp = error.timestamp.toISOString();
    
    console.group(`🚨 [${error.type}] ${timestamp}`);
    console.error('Message:', error.message);
    console.error('User Message:', error.userMessage);
    if (error.details) {
      console.error('Details:', error.details);
    }
    if (error.context) {
      console.error('Context:', error.context);
    }
    console.trace('Stack Trace:');
    console.groupEnd();
  }

  /**
   * Create specific error types for common scenarios
   */
  createEquipmentError(missingItem: 'trap' | 'rug' | 'bait'): AppError {
    const errorType = missingItem === 'trap' 
      ? ErrorType.MISSING_TRAP 
      : missingItem === 'rug' 
        ? ErrorType.MISSING_RUG 
        : ErrorType.MISSING_BAIT;
    
    return createAppError(errorType);
  }

  createResourceError(resource: 'energy' | 'gold' | 'quantity'): AppError {
    const errorType = resource === 'energy' 
      ? ErrorType.INSUFFICIENT_ENERGY 
      : resource === 'gold' 
        ? ErrorType.INSUFFICIENT_GOLD 
        : ErrorType.INSUFFICIENT_QUANTITY;
    
    return createAppError(errorType);
  }

  createLocationError(access: 'no_access' | 'requirements_not_met'): AppError {
    const errorType = access === 'no_access' 
      ? ErrorType.NO_LOCATION_ACCESS 
      : ErrorType.LOCATION_REQUIREMENTS_NOT_MET;
    
    return createAppError(errorType);
  }

  createPurchaseError(reason: 'failed' | 'item_unavailable'): AppError {
    const errorType = reason === 'failed' 
      ? ErrorType.PURCHASE_FAILED 
      : ErrorType.ITEM_NOT_AVAILABLE;
    
    return createAppError(errorType);
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();
