/**
 * Custom hook for scheduled emails management
 * Follows Single Responsibility Principle - handles only scheduled email state and operations
 */

import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { notificationAPI } from '../services/api';
import { TOAST_DURATION } from '../constants/notifications';

export interface ScheduledEmail {
  id: number;
  channel: string;
  recipients: { to: string[]; cc?: string[]; bcc?: string[] };
  payload: any;
  renderedContent: string;
  status: string;
  templateId?: number;
  createdAt: string;
  updatedAt: string;
}

export const useScheduledEmails = () => {
  const toast = useToast();
  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([]);
  const [loading, setLoading] = useState(false);

  const loadScheduledEmails = useCallback(async () => {
    try {
      const response = await notificationAPI.getScheduled({ channel: 'EMAIL' });
      console.log('Loaded scheduled emails:', response.data);
      setScheduledEmails(response.data);
    } catch (error) {
      console.error('Failed to load scheduled emails:', error);
      toast({
        title: 'Failed to load scheduled emails',
        description: 'Could not fetch scheduled emails from server',
        status: 'error',
        duration: TOAST_DURATION.MEDIUM,
      });
    }
  }, [toast]);

  const deleteScheduledEmail = useCallback(async (id: number) => {
    try {
      await notificationAPI.deleteScheduled(id);
      
      toast({
        title: 'Scheduled email cancelled',
        status: 'success',
        duration: TOAST_DURATION.SHORT,
      });
      
      await loadScheduledEmails();
    } catch (error: any) {
      toast({
        title: 'Failed to delete scheduled email',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: TOAST_DURATION.MEDIUM,
      });
    }
  }, [toast, loadScheduledEmails]);

  return {
    scheduledEmails,
    loading,
    setLoading,
    loadScheduledEmails,
    deleteScheduledEmail,
  };
};
