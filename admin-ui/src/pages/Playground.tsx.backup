import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
  Text,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  HStack,
  Badge,
  Code,
  Divider,
  Alert,
  AlertIcon,
  Textarea,
  Select,
} from '@chakra-ui/react';
import { EmailIcon, PhoneIcon } from '@chakra-ui/icons';
import { notificationAPI, templateAPI } from '../services/api';
import RichTextEditor from '../components/RichTextEditor';

const Playground = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Email Form State
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    body: '',
    templateId: '',
    variables: '{}',
  });

  // SMS Form State
  const [smsForm, setSmsForm] = useState({
    to: '',
    body: '',
    templateId: '',
    variables: '{}',
  });

  const loadTemplates = async (channel: string) => {
    try {
      const response = await templateAPI.getAll(channel);
      setTemplates(response.data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleTemplateSelect = async (templateId: string, channel: string) => {
    if (!templateId) {
      setSelectedTemplate(null);
      if (channel === 'EMAIL') {
        setEmailForm({ ...emailForm, templateId: '', subject: '', body: '' });
      } else {
        setSmsForm({ ...smsForm, templateId: '', body: '' });
      }
      return;
    }

    setLoading(true);
    try {
      const response = await templateAPI.getOne(parseInt(templateId));
      const template = response.data;
      setSelectedTemplate(template);
      
      if (channel === 'EMAIL') {
        setEmailForm({
          ...emailForm,
          templateId,
          subject: template.subject || '',
          body: template.bodyHtml || template.body || '',
        });
        
        toast({
          title: 'Template loaded',
          description: `Loaded: ${template.name}`,
          status: 'success',
          duration: 2000,
        });
      } else {
        setSmsForm({
          ...smsForm,
          templateId,
          body: template.bodyText || template.body || '',
        });
        
        toast({
          title: 'Template loaded',
          description: `Loaded: ${template.name}`,
          status: 'success',
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Failed to load template',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 3000,
      });
      setSelectedTemplate(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailForm.to || !emailForm.subject || !emailForm.body) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all required fields',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      let placeholders = {};
      try {
        placeholders = JSON.parse(emailForm.variables);
      } catch (e) {
        toast({
          title: 'Invalid JSON in placeholders',
          status: 'error',
          duration: 3000,
        });
        setLoading(false);
        return;
      }

      const payload: any = {
        idempotencyKey: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        to: [emailForm.to],
        subject: emailForm.subject,
        body: emailForm.body,
        placeholders,
      };

      if (emailForm.templateId) {
        payload.templateId = parseInt(emailForm.templateId);
      }

      await notificationAPI.sendEmail(payload);
      
      toast({
        title: 'Email sent successfully!',
        status: 'success',
        duration: 3000,
      });

      // Reset form
      setEmailForm({
        to: '',
        subject: '',
        body: '',
        templateId: '',
        variables: '{}',
      });
      setSelectedTemplate(null);
    } catch (error: any) {
      toast({
        title: 'Failed to send email',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendSMS = async () => {
    if (!smsForm.to || !smsForm.body) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all required fields',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      let placeholders = {};
      try {
        placeholders = JSON.parse(smsForm.variables);
      } catch (e) {
        toast({
          title: 'Invalid JSON in placeholders',
          status: 'error',
          duration: 3000,
        });
        setLoading(false);
        return;
      }

      const payload: any = {
        idempotencyKey: `sms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        to: smsForm.to,
        message: smsForm.body,
        placeholders,
      };

      if (smsForm.templateId) {
        payload.templateId = parseInt(smsForm.templateId);
      }

      await notificationAPI.sendSms(payload);
      
      toast({
        title: 'SMS sent successfully!',
        status: 'success',
        duration: 3000,
      });

      // Reset form
      setSmsForm({
        to: '',
        body: '',
        templateId: '',
        variables: '{}',
      });
      setSelectedTemplate(null);
    } catch (error: any) {
      toast({
        title: 'Failed to send SMS',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack spacing={8} align="stretch">
      {/* Header */}
      <Box>
        <Heading size="2xl" mb={2} bgGradient="linear(to-r, brand.600, purple.400)" bgClip="text">
          Playground
        </Heading>
        <Text color="gray.500" fontSize="lg">
          Test all notification features in real-time
        </Text>
      </Box>

      {/* Info Alert */}
      <Alert status="info" borderRadius="xl">
        <AlertIcon />
        <Box>
          <Text fontWeight="semibold">Testing Environment</Text>
          <Text fontSize="sm">
            Send test notifications through email and SMS channels. Use templates or custom content.
          </Text>
        </Box>
      </Alert>

      {/* Tabs for Email and SMS */}
      <Card shadow="xl" borderRadius="xl">
        <CardBody>
          <Tabs colorScheme="brand" size="lg">
            <TabList>
              <Tab>
                <HStack>
                  <EmailIcon />
                  <Text>Email</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack>
                  <PhoneIcon />
                  <Text>SMS</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Email Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch" pt={4}>
                  <HStack spacing={4} align="start">
                    <Badge colorScheme="blue" fontSize="md" px={3} py={1} borderRadius="full">
                      Email Channel
                    </Badge>
                  </HStack>

                  <FormControl>
                    <FormLabel fontWeight="semibold">Use Template (Optional)</FormLabel>
                    <Select
                      placeholder="Select a template or write custom content"
                      value={emailForm.templateId}
                      onChange={(e) => handleTemplateSelect(e.target.value, 'EMAIL')}
                      onFocus={() => loadTemplates('EMAIL')}
                    >
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold">To (Email Address)</FormLabel>
                    <Input
                      type="email"
                      placeholder="recipient@example.com"
                      value={emailForm.to}
                      onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold">Subject</FormLabel>
                    <Input
                      placeholder="Email subject"
                      value={emailForm.subject}
                      onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                      isReadOnly={!!emailForm.templateId}
                      bg={emailForm.templateId ? 'gray.50' : 'white'}
                    />
                    {emailForm.templateId && (
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Subject from template (read-only)
                      </Text>
                    )}
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold">Body</FormLabel>
                    {emailForm.templateId ? (
                      <Box
                        p={4}
                        borderWidth="1px"
                        borderRadius="md"
                        borderColor="gray.200"
                        bg="gray.50"
                        minH="150px"
                        maxH="300px"
                        overflowY="auto"
                      >
                        <div dangerouslySetInnerHTML={{ __html: emailForm.body || 'No content' }} />
                      </Box>
                    ) : (
                      <RichTextEditor
                        value={emailForm.body}
                        onChange={(value) => setEmailForm({ ...emailForm, body: value })}
                        placeholder="Enter email content..."
                        height="300px"
                      />
                    )}
                    {emailForm.templateId && (
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Template content is read-only. Use placeholders below to customize.
                      </Text>
                    )}
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="semibold">Placeholders (JSON)</FormLabel>
                    <Textarea
                      placeholder='{"firstName": "John", "companyName": "Acme Inc"}'
                      value={emailForm.variables}
                      onChange={(e) => setEmailForm({ ...emailForm, variables: e.target.value })}
                      rows={4}
                      fontFamily="monospace"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Use placeholders like {'{{'} firstName {'}}'}  in your content. Auto-generated idempotency key.
                    </Text>
                  </FormControl>

                  <Divider />

                  <HStack justify="space-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEmailForm({
                          to: '',
                          subject: '',
                          body: '',
                          templateId: '',
                          variables: '{}',
                        });
                        setSelectedTemplate(null);
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      colorScheme="brand"
                      size="lg"
                      leftIcon={<EmailIcon />}
                      onClick={handleSendEmail}
                      isLoading={loading}
                    >
                      Send Email
                    </Button>
                  </HStack>

                  {selectedTemplate && (
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <Text fontSize="sm" fontWeight="semibold">
                          Using Template: {selectedTemplate.name}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          You can modify the content before sending
                        </Text>
                      </Box>
                    </Alert>
                  )}
                </VStack>
              </TabPanel>

              {/* SMS Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch" pt={4}>
                  <HStack spacing={4} align="start">
                    <Badge colorScheme="purple" fontSize="md" px={3} py={1} borderRadius="full">
                      SMS Channel
                    </Badge>
                  </HStack>

                  <FormControl>
                    <FormLabel fontWeight="semibold">Use Template (Optional)</FormLabel>
                    <Select
                      placeholder="Select a template or write custom content"
                      value={smsForm.templateId}
                      onChange={(e) => handleTemplateSelect(e.target.value, 'SMS')}
                      onFocus={() => loadTemplates('SMS')}
                    >
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold">To (Phone Number)</FormLabel>
                    <Input
                      type="tel"
                      placeholder="+1234567890"
                      value={smsForm.to}
                      onChange={(e) => setSmsForm({ ...smsForm, to: e.target.value })}
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Include country code (e.g., +1 for US)
                    </Text>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold">Message</FormLabel>
                    {smsForm.templateId ? (
                      <Box
                        p={4}
                        borderWidth="1px"
                        borderRadius="md"
                        borderColor="gray.200"
                        bg="gray.50"
                        minH="100px"
                        whiteSpace="pre-wrap"
                      >
                        {smsForm.body || 'No content'}
                      </Box>
                    ) : (
                      <Textarea
                        placeholder="Enter SMS message..."
                        value={smsForm.body}
                        onChange={(e) => setSmsForm({ ...smsForm, body: e.target.value })}
                        rows={6}
                      />
                    )}
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      {smsForm.templateId 
                        ? 'Template content is read-only. Use placeholders below to customize.'
                        : `Character count: ${smsForm.body.length} / 160`
                      }
                    </Text>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="semibold">Placeholders (JSON)</FormLabel>
                    <Textarea
                      placeholder='{"firstName": "John", "code": "123456"}'
                      value={smsForm.variables}
                      onChange={(e) => setSmsForm({ ...smsForm, variables: e.target.value })}
                      rows={4}
                      fontFamily="monospace"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Use placeholders like {'{{'} firstName {'}}'}  in your message. Auto-generated idempotency key.
                    </Text>
                  </FormControl>

                  <Divider />

                  <HStack justify="space-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSmsForm({
                          to: '',
                          body: '',
                          templateId: '',
                          variables: '{}',
                        });
                        setSelectedTemplate(null);
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      colorScheme="purple"
                      size="lg"
                      leftIcon={<PhoneIcon />}
                      onClick={handleSendSMS}
                      isLoading={loading}
                    >
                      Send SMS
                    </Button>
                  </HStack>

                  {selectedTemplate && (
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <Text fontSize="sm" fontWeight="semibold">
                          Using Template: {selectedTemplate.name}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          You can modify the content before sending
                        </Text>
                      </Box>
                    </Alert>
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>

      {/* API Examples */}
      <Card shadow="lg" borderRadius="xl">
        <CardBody>
          <Heading size="md" mb={4}>API Examples</Heading>
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontWeight="semibold" mb={2}>Send Email (cURL)</Text>
              <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm">
{`curl -X POST http://localhost:3000/api/v1/notifications/email \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "idempotencyKey": "unique-key-123",
    "to": ["user@example.com"],
    "subject": "Test Email",
    "body": "Hello {{firstName}}!",
    "placeholders": {"firstName": "John"}
  }'`}
              </Code>
            </Box>

            <Box>
              <Text fontWeight="semibold" mb={2}>Send SMS (cURL)</Text>
              <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm">
{`curl -X POST http://localhost:3000/api/v1/notifications/sms \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "idempotencyKey": "unique-key-456",
    "to": "+1234567890",
    "message": "Your code is {{code}}",
    "placeholders": {"code": "123456"}
  }'`}
              </Code>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default Playground;
