import { toast } from '@/components/ui/use-toast';
import { AppError, ERROR_MESSAGES, ErrorType } from '@/lib/types/errors';

export interface ToastOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Show a success toast message
 */
export function showSuccessToast(
  title: string,
  message?: string,
  options: ToastOptions = {}
): void {
  toast({
    title,
    description: message,
    duration: options.duration || 5000,
    className: 'border-green-200 bg-green-50 text-green-900'
  });
}

/**
 * Show an error toast message
 */
export function showErrorToast(
  title: string,
  message?: string,
  options: ToastOptions = {}
): void {
  toast({
    title,
    description: message,
    duration: options.duration || 7000,
    variant: 'destructive',
    className: 'border-red-200 bg-red-50 text-red-900'
  });
}

/**
 * Show a warning toast message
 */
export function showWarningToast(
  title: string,
  message?: string,
  options: ToastOptions = {}
): void {
  toast({
    title,
    description: message,
    duration: options.duration || 6000,
    className: 'border-yellow-200 bg-yellow-50 text-yellow-900'
  });
}

/**
 * Show an info toast message
 */
export function showInfoToast(
  title: string,
  message?: string,
  options: ToastOptions = {}
): void {
  toast({
    title,
    description: message,
    duration: options.duration || 5000,
    className: 'border-blue-200 bg-blue-50 text-blue-900'
  });
}

/**
 * Show a toast for an AppError with consistent styling
 */
export function showErrorToastFromAppError(
  error: AppError,
  options: ToastOptions = {}
): void {
  const errorInfo = ERROR_MESSAGES[error.type];
  
  showErrorToast(
    errorInfo.title,
    `${errorInfo.message} ${errorInfo.action ? `(${errorInfo.action})` : ''}`,
    options
  );
}

/**
 * Show equipment-related error toasts
 */
export function showEquipmentErrorToast(
  missingItem: 'trap' | 'rug' | 'bait',
  options: ToastOptions = {}
): void {
  const errorType = missingItem === 'trap' 
    ? ErrorType.MISSING_TRAP 
    : missingItem === 'rug' 
      ? ErrorType.MISSING_RUG 
      : ErrorType.MISSING_BAIT;
  
  const errorInfo = ERROR_MESSAGES[errorType];
  
  showErrorToast(
    errorInfo.title,
    errorInfo.message,
    options
  );
}

/**
 * Show resource-related error toasts
 */
export function showResourceErrorToast(
  resource: 'energy' | 'gold' | 'quantity',
  options: ToastOptions = {}
): void {
  const errorType = resource === 'energy' 
    ? ErrorType.INSUFFICIENT_ENERGY 
    : resource === 'gold' 
      ? ErrorType.INSUFFICIENT_GOLD 
      : ErrorType.INSUFFICIENT_QUANTITY;
  
  const errorInfo = ERROR_MESSAGES[errorType];
  
  showErrorToast(
    errorInfo.title,
    errorInfo.message,
    options
  );
}

/**
 * Show location-related error toasts
 */
export function showLocationErrorToast(
  access: 'no_access' | 'requirements_not_met',
  options: ToastOptions = {}
): void {
  const errorType = access === 'no_access' 
    ? ErrorType.NO_LOCATION_ACCESS 
    : ErrorType.LOCATION_REQUIREMENTS_NOT_MET;
  
  const errorInfo = ERROR_MESSAGES[errorType];
  
  showErrorToast(
    errorInfo.title,
    errorInfo.message,
    options
  );
}

/**
 * Show purchase-related error toasts
 */
export function showPurchaseErrorToast(
  reason: 'failed' | 'item_unavailable',
  options: ToastOptions = {}
): void {
  const errorType = reason === 'failed' 
    ? ErrorType.PURCHASE_FAILED 
    : ErrorType.ITEM_NOT_AVAILABLE;
  
  const errorInfo = ERROR_MESSAGES[errorType];
  
  showErrorToast(
    errorInfo.title,
    errorInfo.message,
    options
  );
}

/**
 * Show authentication error toasts
 */
export function showAuthErrorToast(
  errorType: ErrorType.NOT_AUTHENTICATED | ErrorType.INSUFFICIENT_PERMISSIONS,
  options: ToastOptions = {}
): void {
  const errorInfo = ERROR_MESSAGES[errorType];
  
  showErrorToast(
    errorInfo.title,
    errorInfo.message,
    options
  );
}
