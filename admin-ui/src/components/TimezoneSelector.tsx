/**
 * Reusable Timezone Selector Component
 * Follows Single Responsibility Principle
 */

import { FormControl, FormLabel, Select, Text } from '@chakra-ui/react';
import { TIMEZONES } from '../constants/timezones';

interface TimezoneSelectorProps {
  value: string;
  onChange: (timezone: string) => void;
  isRequired?: boolean;
  label?: string;
  helperText?: string;
}

export const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({
  value,
  onChange,
  isRequired = true,
  label = 'Timezone',
  helperText = 'Email will be sent according to the selected timezone',
}) => {
  return (
    <FormControl isRequired={isRequired}>
      <FormLabel fontWeight="semibold">{label}</FormLabel>
      <Select value={value} onChange={(e) => onChange(e.target.value)}>
        {TIMEZONES.map((tz) => (
          <option key={tz.value} value={tz.value}>
            {tz.label}
          </option>
        ))}
      </Select>
      {helperText && (
        <Text fontSize="xs" color="gray.500" mt={1}>
          {helperText}
        </Text>
      )}
    </FormControl>
  );
};
