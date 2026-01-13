import { VStack, Icon, Heading, Text, Button } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

interface EmptyStateProps {
  icon?: any;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  return (
    <VStack spacing={4} py={16} px={4}>
      {icon && (
        <Icon
          as={icon}
          boxSize={16}
          color="gray.300"
        />
      )}
      <Heading size="md" color="gray.600">
        {title}
      </Heading>
      <Text color="gray.500" textAlign="center" maxW="md">
        {description}
      </Text>
      {actionLabel && onAction && (
        <Button
          leftIcon={<AddIcon />}
          colorScheme="brand"
          onClick={onAction}
          mt={4}
        >
          {actionLabel}
        </Button>
      )}
    </VStack>
  );
};
