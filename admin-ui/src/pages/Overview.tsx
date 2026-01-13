import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  SimpleGrid,
  Card,
  CardBody,
  Heading,
  VStack,
  Text,
  Button,
  Icon,
  HStack,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
} from '@chakra-ui/react';
import {
  EmailIcon,
  SettingsIcon,
  ViewIcon,
  TimeIcon,
} from '@chakra-ui/icons';
import { FiBarChart2 } from 'react-icons/fi';
import { RiTestTubeFill } from 'react-icons/ri';
import { outboxAPI, providerAPI, templateAPI } from '../services/api';

const Overview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalNotifications: 0,
    emailsSent: 0,
    smsSent: 0,
    providers: 0,
    templates: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [outboxRes, providersRes, templatesRes] = await Promise.all([
        outboxAPI.getAll(),
        providerAPI.getAll(),
        templateAPI.getAll(),
      ]);

      const notifications = outboxRes.data;
      setStats({
        totalNotifications: notifications.length,
        emailsSent: notifications.filter((n: any) => n.channel === 'EMAIL').length,
        smsSent: notifications.filter((n: any) => n.channel === 'SMS').length,
        providers: providersRes.data.length,
        templates: templatesRes.data.length,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const cardBg = useColorModeValue('white', 'gray.800');

  const quickActions = [
    {
      title: 'Test Notifications',
      description: 'Send test emails and SMS',
      icon: RiTestTubeFill,
      color: 'purple',
      path: '/playground',
    },
    {
      title: 'View Analytics',
      description: 'Detailed performance metrics',
      icon: FiBarChart2,
      color: 'blue',
      path: '/analytics',
    },
    {
      title: 'Monitor Queues',
      description: 'Check job processing status',
      icon: TimeIcon,
      color: 'orange',
      path: '/queues',
    },
    {
      title: 'Manage Templates',
      description: 'Create and edit templates',
      icon: EmailIcon,
      color: 'green',
      path: '/templates',
    },
    {
      title: 'Configure Providers',
      description: 'Setup notification providers',
      icon: SettingsIcon,
      color: 'red',
      path: '/providers',
    },
    {
      title: 'View History',
      description: 'Browse sent notifications',
      icon: ViewIcon,
      color: 'teal',
      path: '/outbox',
    },
  ];

  return (
    <VStack spacing={8} align="stretch">
      {/* Welcome Header */}
      <Box>
        <Heading size="2xl" mb={2} bgGradient="linear(to-r, brand.600, purple.400)" bgClip="text">
          Welcome to Notification Service
        </Heading>
        <Text color="gray.500" fontSize="lg">
          Your central hub for managing multi-channel notifications
        </Text>
      </Box>

      {/* Quick Stats */}
      <SimpleGrid columns={{ base: 1, md: 3, lg: 5 }} spacing={6}>
        <Card bg={cardBg} shadow="md" borderRadius="xl">
          <CardBody>
            <Stat>
              <StatLabel fontSize="sm" color="gray.500">Total Sent</StatLabel>
              <StatNumber fontSize="2xl" color="brand.600">
                {stats.totalNotifications}
              </StatNumber>
              <StatHelpText fontSize="xs">All time</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} shadow="md" borderRadius="xl">
          <CardBody>
            <Stat>
              <StatLabel fontSize="sm" color="gray.500">Emails</StatLabel>
              <StatNumber fontSize="2xl" color="blue.600">
                {stats.emailsSent}
              </StatNumber>
              <StatHelpText fontSize="xs">Delivered</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} shadow="md" borderRadius="xl">
          <CardBody>
            <Stat>
              <StatLabel fontSize="sm" color="gray.500">SMS</StatLabel>
              <StatNumber fontSize="2xl" color="purple.600">
                {stats.smsSent}
              </StatNumber>
              <StatHelpText fontSize="xs">Delivered</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} shadow="md" borderRadius="xl">
          <CardBody>
            <Stat>
              <StatLabel fontSize="sm" color="gray.500">Providers</StatLabel>
              <StatNumber fontSize="2xl" color="green.600">
                {stats.providers}
              </StatNumber>
              <StatHelpText fontSize="xs">Active</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} shadow="md" borderRadius="xl">
          <CardBody>
            <Stat>
              <StatLabel fontSize="sm" color="gray.500">Templates</StatLabel>
              <StatNumber fontSize="2xl" color="orange.600">
                {stats.templates}
              </StatNumber>
              <StatHelpText fontSize="xs">Configured</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Divider />

      {/* Quick Actions */}
      <Box>
        <Heading size="lg" mb={6}>Quick Actions</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {quickActions.map((action) => (
            <Card
              key={action.path}
              bg={cardBg}
              shadow="lg"
              borderRadius="xl"
              cursor="pointer"
              transition="all 0.2s"
              _hover={{
                shadow: 'xl',
                transform: 'translateY(-4px)',
              }}
              onClick={() => navigate(action.path)}
            >
              <CardBody>
                <VStack align="start" spacing={4}>
                  <HStack spacing={3}>
                    <Box
                      bg={`${action.color}.50`}
                      p={3}
                      borderRadius="lg"
                    >
                      <Icon
                        as={action.icon}
                        boxSize={6}
                        color={`${action.color}.600`}
                      />
                    </Box>
                    <Box flex="1">
                      <Text fontWeight="bold" fontSize="lg" color={`${action.color}.600`}>
                        {action.title}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {action.description}
                      </Text>
                    </Box>
                  </HStack>
                  <Button
                    size="sm"
                    colorScheme={action.color}
                    variant="ghost"
                    rightIcon={<Text>→</Text>}
                    w="full"
                  >
                    Go to {action.title}
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Box>

      {/* Getting Started */}
      <Card bg="brand.50" borderRadius="xl" borderWidth="2px" borderColor="brand.200">
        <CardBody>
          <VStack align="start" spacing={4}>
            <Heading size="md" color="brand.700">🚀 Getting Started</Heading>
            <Text color="brand.700">
              New to the notification service? Here's how to get started:
            </Text>
            <VStack align="start" spacing={2} pl={4}>
              <Text fontSize="sm" color="brand.600">
                1. <strong>Configure Providers</strong> - Set up your email and SMS providers
              </Text>
              <Text fontSize="sm" color="brand.600">
                2. <strong>Create Templates</strong> - Design reusable notification templates
              </Text>
              <Text fontSize="sm" color="brand.600">
                3. <strong>Test in Playground</strong> - Send test notifications to verify setup
              </Text>
              <Text fontSize="sm" color="brand.600">
                4. <strong>Monitor Analytics</strong> - Track performance and delivery rates
              </Text>
            </VStack>
            <HStack spacing={3}>
              <Button colorScheme="brand" size="sm" onClick={() => navigate('/providers')}>
                Configure Providers
              </Button>
              <Button variant="outline" colorScheme="brand" size="sm" onClick={() => navigate('/playground')}>
                Try Playground
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default Overview;
