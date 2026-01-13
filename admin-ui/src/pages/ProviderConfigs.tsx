import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  VStack,
  Heading,
  Text,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  Flex,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  HStack,
  IconButton,
  Card,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Switch,
  Divider,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, EmailIcon } from '@chakra-ui/icons';
import { providerAPI } from '../services/api';

const ProviderConfigs = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProvider, setEditingProvider] = useState<any>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isTestOpen, onOpen: onTestOpen, onClose: onTestClose } = useDisclosure();
  const [testingProvider, setTestingProvider] = useState<any>(null);
  const [testEmail, setTestEmail] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const toast = useToast();

  const [formData, setFormData] = useState({
    channel: 'EMAIL',
    providerType: 'SENDGRID',
    credentials: '{}',
    metadata: '{}',
    isActive: true,
    environmentScope: 'development',
  });

  // SMTP form fields
  const [smtpConfig, setSmtpConfig] = useState({
    name: '',
    host: '',
    port: '587',
    secure: false,
    user: '',
    password: '',
    fromEmail: '',
    fromName: '',
  });

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const response = await providerAPI.getAll();
      setProviders(response.data);
    } catch (error) {
      toast({
        title: 'Failed to load providers',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        credentials: JSON.parse(formData.credentials),
        metadata: JSON.parse(formData.metadata),
      };

      if (editingProvider) {
        await providerAPI.update(editingProvider.id, data);
        toast({ title: 'Provider updated', status: 'success', duration: 3000 });
      } else {
        await providerAPI.create(data);
        toast({ title: 'Provider created', status: 'success', duration: 3000 });
      }

      loadProviders();
      onClose();
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Operation failed',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleEdit = async (provider: any) => {
    try {
      // Fetch fresh data from API
      const response = await providerAPI.getOne(provider.id);
      const freshProvider = response.data;
      
      setEditingProvider(freshProvider);
      setFormData({
        channel: freshProvider.channel,
        providerType: freshProvider.providerType,
        credentials: JSON.stringify(freshProvider.credentials, null, 2),
        metadata: JSON.stringify(freshProvider.metadata, null, 2),
        isActive: freshProvider.isActive,
        environmentScope: freshProvider.environmentScope,
      });

      // If it's an SMTP provider, populate the SMTP form fields
      if (freshProvider.providerType === 'SMTP') {
        const creds = freshProvider.credentials;
        const meta = freshProvider.metadata;
        setSmtpConfig({
          name: freshProvider.name || '',
          host: creds.host || '',
          port: creds.port?.toString() || '587',
          secure: creds.secure || false,
          user: creds.auth?.user || '',
          password: creds.auth?.pass || '',
          fromEmail: meta.fromEmail || '',
          fromName: meta.fromName || '',
        });
      }

      onOpen();
    } catch (error) {
      toast({
        title: 'Failed to load provider details',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this provider?')) return;

    try {
      await providerAPI.delete(id);
      toast({ title: 'Provider deleted', status: 'success', duration: 3000 });
      loadProviders();
    } catch (error) {
      toast({ title: 'Failed to delete provider', status: 'error', duration: 3000 });
    }
  };

  const resetForm = () => {
    setEditingProvider(null);
    setFormData({
      channel: 'EMAIL',
      providerType: 'SENDGRID',
      credentials: '{}',
      metadata: '{}',
      isActive: true,
      environmentScope: 'development',
    });
  };

  const handleTestProvider = (provider: any) => {
    setTestingProvider(provider);
    setTestEmail('');
    onTestOpen();
  };

  const sendTestNotification = async () => {
    if (!testingProvider) return;

    const isEmail = testingProvider.channel === 'EMAIL';
    const recipient = isEmail ? testEmail : testEmail; // For SMS, this would be phone number

    if (!recipient) {
      toast({
        title: 'Recipient required',
        description: isEmail ? 'Please enter an email address' : 'Please enter a phone number',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setTestLoading(true);
    try {
      const axios = (await import('axios')).default;
      const token = localStorage.getItem('token');

      const endpoint = isEmail 
        ? '/api/v1/notifications/email'
        : '/api/v1/notifications/sms';

      const payload = isEmail
        ? {
            idempotencyKey: `test-${testingProvider.id}-${Date.now()}`,
            to: [recipient],
            subject: `Test Email from ${testingProvider.name || testingProvider.providerType}`,
            body: `<h1>Test Email</h1><p>This is a test email sent from the <strong>${testingProvider.name || testingProvider.providerType}</strong> provider.</p><p>Provider ID: ${testingProvider.id}</p><p>Sent at: ${new Date().toLocaleString()}</p>`,
          }
        : {
            idempotencyKey: `test-${testingProvider.id}-${Date.now()}`,
            to: recipient,
            message: `Test SMS from ${testingProvider.name || testingProvider.providerType}. Sent at ${new Date().toLocaleString()}`,
          };

      await axios.post(`http://localhost:3000${endpoint}`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      toast({
        title: 'Test notification sent!',
        description: `Check ${isEmail ? 'your email inbox' : 'your phone'} and Bull Board for the job status.`,
        status: 'success',
        duration: 5000,
      });

      onTestClose();
    } catch (error: any) {
      toast({
        title: 'Failed to send test notification',
        description: error.response?.data?.message || error.message || 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <VStack spacing={8} align="stretch">
      <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="2xl" mb={2} bgGradient="linear(to-r, brand.600, blue.400)" bgClip="text">
            Provider Configurations
          </Heading>
          <Text color="gray.500" fontSize="lg">
            Manage notification provider settings and credentials
          </Text>
        </Box>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="brand"
          size="lg"
          onClick={() => {
            resetForm();
            onOpen();
          }}
          shadow="md"
          _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
          transition="all 0.2s"
        >
          Add Provider
        </Button>
      </Flex>

      <Card shadow="xl" borderRadius="xl" overflow="hidden">
        <CardBody p={0}>
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th fontSize="sm" textTransform="none" fontWeight="semibold">Name</Th>
                <Th fontSize="sm" textTransform="none" fontWeight="semibold">Channel</Th>
                <Th fontSize="sm" textTransform="none" fontWeight="semibold">Provider</Th>
                <Th fontSize="sm" textTransform="none" fontWeight="semibold">Environment</Th>
                <Th fontSize="sm" textTransform="none" fontWeight="semibold">Status</Th>
                <Th fontSize="sm" textTransform="none" fontWeight="semibold">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {providers.map((provider: any) => (
                <Tr key={provider.id} _hover={{ bg: 'gray.50' }} transition="all 0.2s">
                  <Td>
                    <Text fontWeight="semibold" fontSize="md">
                      {provider.name || `${provider.providerType} Config`}
                    </Text>
                  </Td>
                  <Td>
                    <Badge colorScheme="blue" fontSize="sm" px={3} py={1} borderRadius="full">
                      {provider.channel}
                    </Badge>
                  </Td>
                  <Td fontWeight="medium">{provider.providerType}</Td>
                  <Td>
                    <Text fontSize="sm" color="gray.600">{provider.environmentScope}</Text>
                  </Td>
                  <Td>
                    <Badge 
                      colorScheme={provider.isActive ? 'green' : 'red'} 
                      fontSize="sm" 
                      px={3} 
                      py={1} 
                      borderRadius="full"
                    >
                      {provider.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Test"
                        icon={<EmailIcon />}
                        size="sm"
                        colorScheme="green"
                        variant="ghost"
                        onClick={() => {
                          setTestingProvider(provider);
                          onTestOpen();
                        }}
                        title="Test Configuration"
                      />
                      <IconButton
                        aria-label="Edit"
                        icon={<EditIcon />}
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => handleEdit(provider)}
                      />
                      <IconButton
                        aria-label="Delete"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDelete(provider.id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {/* Add/Edit Provider Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent maxH="90vh" overflowY="auto">
          <ModalHeader bgGradient="linear(to-r, brand.600, blue.400)" color="white" borderTopRadius="md">
            {editingProvider ? 'Edit' : 'Add'} Provider Configuration
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody pb={6} pt={6}>
            <Tabs colorScheme="brand" variant="enclosed">
              <TabList>
                <Tab fontWeight="semibold">📧 SMTP Email</Tab>
                <Tab fontWeight="semibold">🚀 SendGrid</Tab>
                <Tab fontWeight="semibold">📱 Other</Tab>
              </TabList>

              <TabPanels>
                {/* SMTP Configuration Tab */}
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle fontSize="sm">SMTP Email Configuration</AlertTitle>
                        <AlertDescription fontSize="xs">
                          Configure your own SMTP server for sending emails
                        </AlertDescription>
                      </Box>
                    </Alert>

                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold">Configuration Name</FormLabel>
                      <Input
                        placeholder="My Gmail SMTP"
                        value={smtpConfig.name}
                        onChange={(e) => setSmtpConfig({ ...smtpConfig, name: e.target.value })}
                      />
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Give this configuration a friendly name to identify it
                      </Text>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold">SMTP Host</FormLabel>
                      <Input
                        placeholder="smtp.gmail.com"
                        value={smtpConfig.host}
                        onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                      />
                    </FormControl>

                    <HStack>
                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold">Port</FormLabel>
                        <Input
                          placeholder="587"
                          value={smtpConfig.port}
                          onChange={(e) => setSmtpConfig({ ...smtpConfig, port: e.target.value })}
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center" mt={8}>
                        <FormLabel mb={0} fontWeight="semibold">SSL/TLS</FormLabel>
                        <Switch
                          isChecked={smtpConfig.secure}
                          onChange={(e) => setSmtpConfig({ ...smtpConfig, secure: e.target.checked })}
                          colorScheme="brand"
                        />
                      </FormControl>
                    </HStack>

                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold">Username / Email</FormLabel>
                      <Input
                        placeholder="your-email@gmail.com"
                        value={smtpConfig.user}
                        onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold">Password / App Password</FormLabel>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={smtpConfig.password}
                        onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                      />
                    </FormControl>

                    <Divider />

                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold">From Email</FormLabel>
                      <Input
                        placeholder="noreply@yourdomain.com"
                        value={smtpConfig.fromEmail}
                        onChange={(e) => setSmtpConfig({ ...smtpConfig, fromEmail: e.target.value })}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="semibold">From Name</FormLabel>
                      <Input
                        placeholder="Your Company Name"
                        value={smtpConfig.fromName}
                        onChange={(e) => setSmtpConfig({ ...smtpConfig, fromName: e.target.value })}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="semibold">Environment</FormLabel>
                      <Select
                        value={formData.environmentScope}
                        onChange={(e) => setFormData({ ...formData, environmentScope: e.target.value })}
                      >
                        <option value="development">Development</option>
                        <option value="staging">Staging</option>
                        <option value="production">Production</option>
                      </Select>
                    </FormControl>

                    <HStack w="full" justify="flex-end" spacing={3} pt={4}>
                      <Button onClick={onClose}>Cancel</Button>
                      <Button
                        colorScheme="brand"
                        onClick={() => {
                          const credentials = {
                            host: smtpConfig.host,
                            port: parseInt(smtpConfig.port),
                            secure: smtpConfig.secure,
                            auth: {
                              user: smtpConfig.user,
                              pass: smtpConfig.password,
                            },
                          };
                          const metadata = {
                            fromEmail: smtpConfig.fromEmail,
                            fromName: smtpConfig.fromName,
                          };
                          const updatedFormData = {
                            ...formData,
                            name: smtpConfig.name,
                            channel: 'EMAIL',
                            providerType: 'SMTP',
                            credentials: JSON.stringify(credentials),
                            metadata: JSON.stringify(metadata),
                          };
                          setFormData(updatedFormData);
                          
                          // Submit with name
                          (async () => {
                            try {
                              const data = {
                                ...updatedFormData,
                                credentials: JSON.parse(updatedFormData.credentials),
                                metadata: JSON.parse(updatedFormData.metadata),
                              };

                              if (editingProvider) {
                                await providerAPI.update(editingProvider.id, data);
                                toast({ title: 'Provider updated', status: 'success', duration: 3000 });
                              } else {
                                await providerAPI.create(data);
                                toast({ title: 'Provider created', status: 'success', duration: 3000 });
                              }

                              loadProviders();
                              onClose();
                              resetForm();
                            } catch (error: any) {
                              toast({
                                title: 'Operation failed',
                                description: error.response?.data?.message || 'An error occurred',
                                status: 'error',
                                duration: 5000,
                              });
                            }
                          })();
                        }}
                      >
                        {editingProvider ? 'Update' : 'Create'} SMTP Provider
                      </Button>
                    </HStack>
                  </VStack>
                </TabPanel>

                {/* SendGrid Tab */}
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle fontSize="sm">SendGrid Configuration</AlertTitle>
                        <AlertDescription fontSize="xs">
                          Use SendGrid API for reliable email delivery
                        </AlertDescription>
                      </Box>
                    </Alert>

                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold">SendGrid API Key</FormLabel>
                      <Input
                        type="password"
                        placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxx"
                        value={formData.credentials !== '{}' ? JSON.parse(formData.credentials).apiKey || '' : ''}
                        onChange={(e) => {
                          const creds = { apiKey: e.target.value };
                          setFormData({ ...formData, credentials: JSON.stringify(creds) });
                        }}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold">From Email</FormLabel>
                      <Input
                        placeholder="noreply@yourdomain.com"
                        value={formData.metadata !== '{}' ? JSON.parse(formData.metadata).fromEmail || '' : ''}
                        onChange={(e) => {
                          const meta = JSON.parse(formData.metadata || '{}');
                          meta.fromEmail = e.target.value;
                          setFormData({ ...formData, metadata: JSON.stringify(meta) });
                        }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="semibold">From Name</FormLabel>
                      <Input
                        placeholder="Your Company"
                        value={formData.metadata !== '{}' ? JSON.parse(formData.metadata).fromName || '' : ''}
                        onChange={(e) => {
                          const meta = JSON.parse(formData.metadata || '{}');
                          meta.fromName = e.target.value;
                          setFormData({ ...formData, metadata: JSON.stringify(meta) });
                        }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="semibold">Environment</FormLabel>
                      <Select
                        value={formData.environmentScope}
                        onChange={(e) => setFormData({ ...formData, environmentScope: e.target.value })}
                      >
                        <option value="development">Development</option>
                        <option value="staging">Staging</option>
                        <option value="production">Production</option>
                      </Select>
                    </FormControl>

                    <HStack w="full" justify="flex-end" spacing={3} pt={4}>
                      <Button onClick={onClose}>Cancel</Button>
                      <Button
                        colorScheme="brand"
                        onClick={() => {
                          setFormData({ ...formData, channel: 'EMAIL', providerType: 'SENDGRID' });
                          handleSubmit();
                        }}
                      >
                        {editingProvider ? 'Update' : 'Create'} SendGrid Provider
                      </Button>
                    </HStack>
                  </VStack>
                </TabPanel>

                {/* Other Providers Tab */}
                <TabPanel>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Channel</FormLabel>
                      <Select
                        value={formData.channel}
                        onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                      >
                        <option value="EMAIL">Email</option>
                        <option value="SMS">SMS</option>
                        <option value="VOICE">Voice</option>
                        <option value="PUSH">Push</option>
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Provider Type</FormLabel>
                      <Select
                        value={formData.providerType}
                        onChange={(e) => setFormData({ ...formData, providerType: e.target.value })}
                      >
                        <option value="TWILIO">Twilio</option>
                        <option value="MOCK">Mock</option>
                        <option value="ONESIGNAL">OneSignal</option>
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Credentials (JSON)</FormLabel>
                      <Textarea
                        value={formData.credentials}
                        onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
                        rows={4}
                        fontFamily="mono"
                        fontSize="sm"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Metadata (JSON)</FormLabel>
                      <Textarea
                        value={formData.metadata}
                        onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
                        rows={4}
                        fontFamily="mono"
                        fontSize="sm"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Environment Scope</FormLabel>
                      <Input
                        value={formData.environmentScope}
                        onChange={(e) =>
                          setFormData({ ...formData, environmentScope: e.target.value })
                        }
                      />
                    </FormControl>

                    <HStack w="full" justify="flex-end" spacing={3}>
                      <Button onClick={onClose}>Cancel</Button>
                      <Button colorScheme="brand" onClick={handleSubmit}>
                        {editingProvider ? 'Update' : 'Create'}
                      </Button>
                    </HStack>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Test Notification Modal */}
      <Modal isOpen={isTestOpen} onClose={onTestClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bgGradient="linear(to-r, green.600, teal.400)" color="white" borderTopRadius="md">
            🧪 Test {testingProvider?.channel === 'EMAIL' ? 'Email' : 'SMS'} Provider
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody pb={6} pt={6}>
            <VStack spacing={4}>
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle fontSize="sm">
                    Send Real {testingProvider?.channel === 'EMAIL' ? 'Email' : 'SMS'}
                  </AlertTitle>
                  <AlertDescription fontSize="xs">
                    Provider: {testingProvider?.name || testingProvider?.providerType} ({testingProvider?.environmentScope})
                  </AlertDescription>
                </Box>
              </Alert>

              <FormControl isRequired>
                <FormLabel fontWeight="semibold">
                  {testingProvider?.channel === 'EMAIL' ? 'Recipient Email' : 'Recipient Phone Number'}
                </FormLabel>
                <Input
                  type={testingProvider?.channel === 'EMAIL' ? 'email' : 'tel'}
                  placeholder={testingProvider?.channel === 'EMAIL' ? 'test@example.com' : '+1234567890'}
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {testingProvider?.channel === 'EMAIL' 
                    ? 'Enter the email address where you want to receive the test email'
                    : 'Enter the phone number (with country code) where you want to receive the test SMS'}
                </Text>
              </FormControl>

              <HStack w="full" justify="flex-end" spacing={3}>
                <Button onClick={onTestClose} isDisabled={testLoading}>
                  Cancel
                </Button>
                <Button
                  colorScheme="green"
                  leftIcon={testLoading ? <Spinner size="sm" /> : <EmailIcon />}
                  onClick={sendTestNotification}
                  isLoading={testLoading}
                  loadingText="Sending..."
                >
                  Send Test {testingProvider?.channel === 'EMAIL' ? 'Email' : 'SMS'}
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default ProviderConfigs;
