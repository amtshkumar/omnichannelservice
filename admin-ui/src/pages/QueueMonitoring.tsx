import { Box, Heading, Text, VStack, Card, CardBody, Alert, AlertIcon } from '@chakra-ui/react';

const QueueMonitoring = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const bullBoardUrl = `${API_URL}/admin/queues`;

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Box>
        <Heading size="2xl" mb={2} bgGradient="linear(to-r, brand.600, purple.400)" bgClip="text">
          Queue Monitoring
        </Heading>
        <Text color="gray.500" fontSize="lg">
          Monitor and manage notification queues with Bull Board
        </Text>
      </Box>

      {/* Info Alert */}
      <Alert status="info" borderRadius="xl">
        <AlertIcon />
        <Box>
          <Text fontWeight="semibold">Bull Board Dashboard</Text>
          <Text fontSize="sm">
            View queue jobs, retry failed jobs, and monitor queue performance in real-time
          </Text>
        </Box>
      </Alert>

      {/* Bull Board Iframe */}
      <Card shadow="xl" borderRadius="xl" overflow="hidden">
        <CardBody p={0}>
          <Box
            as="iframe"
            src={bullBoardUrl}
            w="100%"
            h="calc(100vh - 300px)"
            minH="600px"
            border="none"
            title="Bull Board Queue Monitoring"
          />
        </CardBody>
      </Card>
    </VStack>
  );
};

export default QueueMonitoring;
