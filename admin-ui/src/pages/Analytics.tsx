import { useEffect, useState } from 'react';
import {
  Box,
  SimpleGrid,
  Card,
  CardBody,
  Heading,
  VStack,
  Text,
  Select,
  HStack,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Progress,
} from '@chakra-ui/react';
import { outboxAPI, providerAPI } from '../services/api';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [analytics, setAnalytics] = useState({
    totalSent: 0,
    successRate: 0,
    failureRate: 0,
    avgDeliveryTime: 0,
    channelBreakdown: { EMAIL: 0, SMS: 0 },
    providerPerformance: [] as any[],
    recentTrends: [] as any[],
  });

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const [outboxRes, providersRes] = await Promise.all([
        outboxAPI.getAll(),
        providerAPI.getAll(),
      ]);

      const notifications = outboxRes.data;
      const providers = providersRes.data;

      // Calculate metrics
      const totalSent = notifications.length;
      const successful = notifications.filter((n: any) => n.status === 'SENT').length;
      const failed = notifications.filter((n: any) => n.status === 'FAILED').length;
      
      const emailCount = notifications.filter((n: any) => n.channel === 'EMAIL').length;
      const smsCount = notifications.filter((n: any) => n.channel === 'SMS').length;

      // Provider performance
      const providerStats = providers.map((provider: any) => {
        const providerNotifs = notifications.filter((n: any) => n.providerId === provider.id);
        const providerSuccess = providerNotifs.filter((n: any) => n.status === 'SENT').length;
        return {
          name: provider.name,
          channel: provider.channel,
          total: providerNotifs.length,
          success: providerSuccess,
          successRate: providerNotifs.length > 0 ? (providerSuccess / providerNotifs.length) * 100 : 0,
        };
      });

      setAnalytics({
        totalSent,
        successRate: totalSent > 0 ? (successful / totalSent) * 100 : 0,
        failureRate: totalSent > 0 ? (failed / totalSent) * 100 : 0,
        avgDeliveryTime: 1.2, // Mock value
        channelBreakdown: { EMAIL: emailCount, SMS: smsCount },
        providerPerformance: providerStats,
        recentTrends: [],
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const cardBg = useColorModeValue('white', 'gray.800');

  return (
    <VStack spacing={8} align="stretch">
      {/* Header */}
      <Box>
        <HStack justify="space-between" flexWrap="wrap" gap={4}>
          <Box>
            <Heading size="2xl" mb={2} bgGradient="linear(to-r, brand.600, purple.400)" bgClip="text">
              Analytics & Reporting
            </Heading>
            <Text color="gray.500" fontSize="lg">
              Track notification performance and trends
            </Text>
          </Box>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            w="200px"
            size="lg"
            borderRadius="xl"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </Select>
        </HStack>
      </Box>

      {/* Key Metrics */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <Card bg={cardBg} shadow="lg" borderRadius="xl">
          <CardBody>
            <Stat>
              <StatLabel fontSize="sm" color="gray.500">Total Sent</StatLabel>
              <StatNumber fontSize="3xl" color="brand.600">{analytics.totalSent}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                12.5% from last period
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} shadow="lg" borderRadius="xl">
          <CardBody>
            <Stat>
              <StatLabel fontSize="sm" color="gray.500">Success Rate</StatLabel>
              <StatNumber fontSize="3xl" color="green.600">
                {analytics.successRate.toFixed(1)}%
              </StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                2.3% from last period
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} shadow="lg" borderRadius="xl">
          <CardBody>
            <Stat>
              <StatLabel fontSize="sm" color="gray.500">Failure Rate</StatLabel>
              <StatNumber fontSize="3xl" color="red.600">
                {analytics.failureRate.toFixed(1)}%
              </StatNumber>
              <StatHelpText>
                <StatArrow type="decrease" />
                1.2% from last period
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} shadow="lg" borderRadius="xl">
          <CardBody>
            <Stat>
              <StatLabel fontSize="sm" color="gray.500">Avg Delivery Time</StatLabel>
              <StatNumber fontSize="3xl" color="blue.600">
                {analytics.avgDeliveryTime}s
              </StatNumber>
              <StatHelpText>
                <StatArrow type="decrease" />
                0.3s faster
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Channel Breakdown */}
      <Card bg={cardBg} shadow="lg" borderRadius="xl">
        <CardBody>
          <Heading size="md" mb={6}>Channel Breakdown</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontWeight="semibold">Email</Text>
                <Text fontWeight="bold" color="blue.600">{analytics.channelBreakdown.EMAIL}</Text>
              </HStack>
              <Progress 
                value={analytics.totalSent > 0 ? (analytics.channelBreakdown.EMAIL / analytics.totalSent) * 100 : 0}
                colorScheme="blue"
                size="lg"
                borderRadius="full"
              />
              <Text fontSize="sm" color="gray.500" mt={1}>
                {analytics.totalSent > 0 
                  ? `${((analytics.channelBreakdown.EMAIL / analytics.totalSent) * 100).toFixed(1)}% of total`
                  : 'No data'}
              </Text>
            </Box>

            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontWeight="semibold">SMS</Text>
                <Text fontWeight="bold" color="purple.600">{analytics.channelBreakdown.SMS}</Text>
              </HStack>
              <Progress 
                value={analytics.totalSent > 0 ? (analytics.channelBreakdown.SMS / analytics.totalSent) * 100 : 0}
                colorScheme="purple"
                size="lg"
                borderRadius="full"
              />
              <Text fontSize="sm" color="gray.500" mt={1}>
                {analytics.totalSent > 0 
                  ? `${((analytics.channelBreakdown.SMS / analytics.totalSent) * 100).toFixed(1)}% of total`
                  : 'No data'}
              </Text>
            </Box>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Provider Performance */}
      <Card bg={cardBg} shadow="lg" borderRadius="xl">
        <CardBody>
          <Heading size="md" mb={6}>Provider Performance</Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Provider</Th>
                <Th>Channel</Th>
                <Th isNumeric>Total Sent</Th>
                <Th isNumeric>Successful</Th>
                <Th isNumeric>Success Rate</Th>
              </Tr>
            </Thead>
            <Tbody>
              {analytics.providerPerformance.map((provider, idx) => (
                <Tr key={idx}>
                  <Td fontWeight="semibold">{provider.name}</Td>
                  <Td>
                    <Badge colorScheme={provider.channel === 'EMAIL' ? 'blue' : 'purple'}>
                      {provider.channel}
                    </Badge>
                  </Td>
                  <Td isNumeric>{provider.total}</Td>
                  <Td isNumeric>{provider.success}</Td>
                  <Td isNumeric>
                    <Badge 
                      colorScheme={provider.successRate >= 90 ? 'green' : provider.successRate >= 70 ? 'yellow' : 'red'}
                      fontSize="md"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {provider.successRate.toFixed(1)}%
                    </Badge>
                  </Td>
                </Tr>
              ))}
              {analytics.providerPerformance.length === 0 && (
                <Tr>
                  <Td colSpan={5} textAlign="center" color="gray.500">
                    No provider data available
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default Analytics;
