import { PostgrestError } from '@supabase/supabase-js';

export const handleSupabaseError = (error: PostgrestError | Error | null, context: string): string => {
  if (!error) return 'Unknown error occurred';

  console.error(`${context}:`, error);

  if ('code' in error && 'message' in error) {
    // PostgrestError
    const postgrestError = error as PostgrestError;
    
    // Handle specific error codes
    switch (postgrestError.code) {
      case '23505':
        return 'This record already exists';
      case '23503':
        return 'Cannot delete: record is referenced by other data';
      case '42501':
        return 'Permission denied';
      case 'PGRST301':
        return 'Record not found';
      default:
        return postgrestError.message || 'Database error occurred';
    }
  }

  return error.message || 'An error occurred';
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
};
