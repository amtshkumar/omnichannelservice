/**
 * Custom hook for template management
 * Follows Single Responsibility Principle - handles only template operations
 */

import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { templateAPI } from '../services/api';
import { TOAST_DURATION } from '../constants/notifications';

export const useTemplates = () => {
  const toast = useToast();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTemplates = useCallback(async (channel?: string) => {
    try {
      const response = await templateAPI.getAll(channel);
      setTemplates(response.data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  }, []);

  const selectTemplate = useCallback(async (templateId: string, onSuccess: (template: any) => void) => {
    if (!templateId) {
      onSuccess({ subject: '', body: '' });
      return;
    }

    setLoading(true);
    try {
      const response = await templateAPI.getOne(parseInt(templateId));
      const template = response.data;
      
      onSuccess(template);
      
      toast({
        title: 'Template loaded',
        description: `Loaded: ${template.name}`,
        status: 'success',
        duration: TOAST_DURATION.SHORT,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to load template',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: TOAST_DURATION.MEDIUM,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    templates,
    loading,
    loadTemplates,
    selectTemplate,
  };
};
