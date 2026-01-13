import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ApiAttribute {
  type: string;
  required: boolean;
  description: string;
}

export interface ApiExample {
  title: string;
  description: string;
  endpoint: string;
  method: string;
  requiresAuth?: boolean;
  example: {
    request: any;
    response: any;
  };
  curl: string;
  attributes?: Record<string, ApiAttribute>;
  notes?: string;
}

export interface ApiDocs {
  authentication: ApiExample;
  sendEmail: ApiExample;
  scheduleEmail: ApiExample;
  sendSms: ApiExample;
  bulkEmail: ApiExample;
  responseFormats: any;
  quickReference: {
    baseUrl: string;
    swaggerDocs: string;
    bullBoard: string;
    defaultCredentials: {
      email: string;
      password: string;
    };
    tips: string[];
  };
}

export const useApiDocs = () => {
  const [docs, setDocs] = useState<ApiDocs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/api-docs/examples`);
        setDocs(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch API documentation');
        console.error('Error fetching API docs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, []);

  return { docs, loading, error };
};
