import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { proRequestService } from '../services';
import type { ProRequest } from '../types';
import { useAuth } from '../contexts';

export function useProRequest() {
  const { user } = useAuth();
  const [myRequest, setMyRequest] = useState<ProRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMyRequest = useCallback(async () => {
    if (!user) return;
    
    try {
      const data = await proRequestService.getMyRequest();
      setMyRequest(data);
    } catch (error) {
      console.error('Failed to fetch PRO request:', error);
    }
  }, [user]);

  const submitRequest = useCallback(async (paymentConfirmed: boolean): Promise<boolean> => {
    if (!paymentConfirmed) {
      toast.error('Please confirm that you have paid for PRO version');
      return false;
    }

    setIsLoading(true);
    try {
      await proRequestService.submit(paymentConfirmed);
      toast.success('PRO request submitted successfully! It may take up to 3 hours to process your request.', { duration: 6000 });
      await fetchMyRequest();
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit request';
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchMyRequest]);

  // Fetch on mount
  useEffect(() => {
    if (user) {
      fetchMyRequest();
    }
  }, [user, fetchMyRequest]);

  return {
    myRequest,
    isLoading,
    fetchMyRequest,
    submitRequest,
  };
}
