/**
 * Reusable Status Badge Component
 * Follows Single Responsibility and Open/Closed Principles
 */

import { Badge } from '@chakra-ui/react';
import { STATUS_COLORS, NotificationStatus } from '../constants/notifications';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const colorScheme = STATUS_COLORS[status as NotificationStatus] || 'gray';

  return (
    <Badge colorScheme={colorScheme} fontSize={size}>
      {status}
    </Badge>
  );
};
