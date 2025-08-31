// Centralized error types and constants for Meowshunt

export enum ErrorType {
  // Equipment errors
  MISSING_TRAP = 'MISSING_TRAP',
  MISSING_RUG = 'MISSING_RUG',
  MISSING_BAIT = 'MISSING_BAIT',
  
  // Resource errors
  INSUFFICIENT_ENERGY = 'INSUFFICIENT_ENERGY',
  INSUFFICIENT_GOLD = 'INSUFFICIENT_GOLD',
  INSUFFICIENT_QUANTITY = 'INSUFFICIENT_QUANTITY',
  
  // Location errors
  NO_LOCATION_ACCESS = 'NO_LOCATION_ACCESS',
  LOCATION_REQUIREMENTS_NOT_MET = 'LOCATION_REQUIREMENTS_NOT_MET',
  
  // Purchase errors
  PURCHASE_FAILED = 'PURCHASE_FAILED',
  ITEM_NOT_AVAILABLE = 'ITEM_NOT_AVAILABLE',
  
  // Authentication errors
  NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // General errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface AppError {
  type: ErrorType;
  message: string;
  userMessage: string;
  details?: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}

export const ERROR_MESSAGES = {
  [ErrorType.MISSING_TRAP]: {
    title: 'Missing Trap',
    message: 'You need a trap to hunt Meows!',
    action: 'Visit the shop to purchase a trap'
  },
  [ErrorType.MISSING_RUG]: {
    title: 'Missing Rug',
    message: 'A rug helps attract Meows to your trap!',
    action: 'Visit the shop to purchase a rug'
  },
  [ErrorType.MISSING_BAIT]: {
    title: 'Missing Bait',
    message: 'Bait increases your chances of catching Meows!',
    action: 'Visit the shop to purchase bait'
  },
  [ErrorType.INSUFFICIENT_ENERGY]: {
    title: 'Out of Energy',
    message: 'You need energy to hunt Meows!',
    action: 'Wait for energy to regenerate or use energy items'
  },
  [ErrorType.INSUFFICIENT_GOLD]: {
    title: 'Insufficient Gold',
    message: 'You don\'t have enough gold for this purchase!',
    action: 'Hunt more Meows to earn gold'
  },
  [ErrorType.INSUFFICIENT_QUANTITY]: {
    title: 'Insufficient Quantity',
    message: 'You don\'t have enough of this item!',
    action: 'Check your inventory or purchase more'
  },
  [ErrorType.NO_LOCATION_ACCESS]: {
    title: 'Location Locked',
    message: 'You don\'t have access to this location yet!',
    action: 'Meet the requirements or unlock through progression'
  },
  [ErrorType.LOCATION_REQUIREMENTS_NOT_MET]: {
    title: 'Requirements Not Met',
    message: 'You don\'t meet the requirements for this location!',
    action: 'Check what you need to unlock this area'
  },
  [ErrorType.PURCHASE_FAILED]: {
    title: 'Purchase Failed',
    message: 'Unable to complete your purchase!',
    action: 'Check your gold and try again'
  },
  [ErrorType.ITEM_NOT_AVAILABLE]: {
    title: 'Item Unavailable',
    message: 'This item is not currently available!',
    action: 'Check back later or try a different item'
  },
  [ErrorType.NOT_AUTHENTICATED]: {
    title: 'Authentication Required',
    message: 'You need to be logged in to perform this action!',
    action: 'Please sign in to continue'
  },
  [ErrorType.INSUFFICIENT_PERMISSIONS]: {
    title: 'Access Denied',
    message: 'You don\'t have permission to perform this action!',
    action: 'Contact an administrator if you believe this is an error'
  },
  [ErrorType.NETWORK_ERROR]: {
    title: 'Connection Error',
    message: 'Unable to connect to the server!',
    action: 'Check your internet connection and try again'
  },
  [ErrorType.VALIDATION_ERROR]: {
    title: 'Invalid Input',
    message: 'Please check your input and try again!',
    action: 'Review the form and correct any errors'
  },
  [ErrorType.UNKNOWN_ERROR]: {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred!',
    action: 'Try refreshing the page or contact support'
  }
} as const;

export function createAppError(
  type: ErrorType,
  details?: string,
  context?: Record<string, unknown>
): AppError {
  return {
    type,
    message: ERROR_MESSAGES[type].message,
    userMessage: ERROR_MESSAGES[type].message,
    details,
    timestamp: new Date(),
    context
  };
}

export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'message' in error &&
    'userMessage' in error
  );
}
