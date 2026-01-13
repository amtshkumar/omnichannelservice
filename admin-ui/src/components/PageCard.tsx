import { Card, CardBody, CardHeader, Heading, Text, Box, useColorModeValue } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface PageCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  headerAction?: ReactNode;
}

export const PageCard = ({ title, description, children, headerAction }: PageCardProps) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('white', 'gray.800');

  return (
    <Card
      shadow="xl"
      borderRadius="2xl"
      borderWidth="1px"
      borderColor={borderColor}
      bg={bgColor}
      overflow="hidden"
    >
      {(title || description || headerAction) && (
        <CardHeader
          bg={useColorModeValue('gray.50', 'gray.900')}
          borderBottomWidth="1px"
          borderColor={borderColor}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={4}>
            <Box>
              {title && (
                <Heading size="md" mb={description ? 1 : 0}>
                  {title}
                </Heading>
              )}
              {description && (
                <Text fontSize="sm" color="gray.500">
                  {description}
                </Text>
              )}
            </Box>
            {headerAction && <Box>{headerAction}</Box>}
          </Box>
        </CardHeader>
      )}
      <CardBody p={0}>{children}</CardBody>
    </Card>
  );
};
