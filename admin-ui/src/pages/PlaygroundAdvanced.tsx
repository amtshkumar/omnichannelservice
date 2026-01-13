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
  Divider,
  Alert,
  AlertIcon,
  Textarea,
  Select,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Switch,
  NumberInput,
  NumberInputField,
  Icon,
} from '@chakra-ui/react';
import { EmailIcon, PhoneIcon, AddIcon, DeleteIcon, TimeIcon, RepeatIcon, LinkIcon } from '@chakra-ui/icons';
import { notificationAPI, templateAPI } from '../services/api';
import RichTextEditor from '../components/RichTextEditor';
import { TOAST_DURATION } from '../constants/notifications';
import { generateIdempotencyKey } from '../utils/scheduledEmailHelpers';

interface BulkRecipient {
  id: string;
  to: string;
  placeholders: string;
}

const PlaygroundAdvanced = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Single Email Form
  const [emailForm, setEmailForm] = useState({
    to: '',
    cc: '',
    bcc: '',
    replyTo: '',
    subject: '',
    body: '',
    templateId: '',
    placeholders: '{}',
    attachments: [] as File[],
  });

  // Bulk Email Form
  const [bulkRecipients, setBulkRecipients] = useState<BulkRecipient[]>([
    { id: '1', to: '', placeholders: '{}' },
  ]);
  const [bulkTemplate, setBulkTemplate] = useState('');
  const [bulkSubject, setBulkSubject] = useState('');

  // Scheduled Notification
  const [scheduledForm, setScheduledForm] = useState({
    to: '',
    subject: '',
    body: '',
    scheduleAt: '',
    timezone: 'UTC',
  });

  // Webhook Test
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookPayload, setWebhookPayload] = useState('{\n  "event": "test",\n  "data": {}\n}');

  const loadTemplates = async (channel: string) => {
    try {
      const response = await templateAPI.getAll(channel);
      setTemplates(response.data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setEmailForm({ ...emailForm, attachments: [...emailForm.attachments, ...files] });
    }
  };

  const removeAttachment = (index: number) => {
    const newAttachments = emailForm.attachments.filter((_, i) => i !== index);
    setEmailForm({ ...emailForm, attachments: newAttachments });
  };

  const handleSendEmailWithAttachments = async () => {
    if (!emailForm.to || !emailForm.subject || !emailForm.body) {
      toast({
        title: 'Missing required fields',
        status: 'warning',
        duration: TOAST_DURATION.MEDIUM,
      });
      return;
    }

    setLoading(true);
    try {
      const placeholders = JSON.parse(emailForm.placeholders);
      
      // Convert files to base64
      const attachments = await Promise.all(
        emailForm.attachments.map(async (file) => {
          const base64 = await fileToBase64(file);
          return {
            filename: file.name,
            content: base64.split(',')[1], // Remove data:mime;base64, prefix
            type: file.type,
          };
        })
      );

      const payload: any = {
        idempotencyKey: generateIdempotencyKey('email'),
        to: [emailForm.to],
        subject: emailForm.subject,
        body: emailForm.body,
        placeholders,
      };

      if (emailForm.cc) payload.cc = emailForm.cc.split(',').map(e => e.trim());
      if (emailForm.bcc) payload.bcc = emailForm.bcc.split(',').map(e => e.trim());
      if (emailForm.replyTo) payload.replyTo = emailForm.replyTo;
      if (attachments.length > 0) payload.attachments = attachments;
      if (emailForm.templateId) payload.templateId = parseInt(emailForm.templateId);

      await notificationAPI.sendEmail(payload);
      
      toast({
        title: 'Email sent successfully!',
        description: attachments.length > 0 ? `With ${attachments.length} attachment(s)` : undefined,
        status: 'success',
        duration: TOAST_DURATION.MEDIUM,
      });

      // Reset form
      setEmailForm({
        to: '',
        cc: '',
        bcc: '',
        replyTo: '',
        subject: '',
        body: '',
        templateId: '',
        placeholders: '{}',
        attachments: [],
      });
    } catch (error: any) {
      toast({
        title: 'Failed to send email',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: TOAST_DURATION.LONG,
      });
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const addBulkRecipient = () => {
    setBulkRecipients([
      ...bulkRecipients,
      { id: Date.now().toString(), to: '', placeholders: '{}' },
    ]);
  };

  const removeBulkRecipient = (id: string) => {
    setBulkRecipients(bulkRecipients.filter(r => r.id !== id));
  };

  const updateBulkRecipient = (id: string, field: string, value: string) => {
    setBulkRecipients(
      bulkRecipients.map(r => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleSendBulkEmail = async () => {
    if (!bulkTemplate || bulkRecipients.length === 0) {
      toast({
        title: 'Missing required fields',
        description: 'Select a template and add recipients',
        status: 'warning',
        duration: TOAST_DURATION.MEDIUM,
      });
      return;
    }

    setLoading(true);
    try {
      const notifications = bulkRecipients.map(recipient => ({
        idempotencyKey: generateIdempotencyKey(`bulk-${recipient.id}`),
        to: [recipient.to],
        templateId: parseInt(bulkTemplate),
        subject: bulkSubject,
        placeholders: JSON.parse(recipient.placeholders || '{}'),
      }));

      await notificationAPI.sendBulkEmail({ notifications });
      
      toast({
        title: 'Bulk emails queued!',
        description: `${notifications.length} emails queued for delivery`,
        status: 'success',
        duration: TOAST_DURATION.MEDIUM,
      });

      setBulkRecipients([{ id: '1', to: '', placeholders: '{}' }]);
    } catch (error: any) {
      toast({
        title: 'Failed to send bulk emails',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: TOAST_DURATION.LONG,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      toast({
        title: 'Webhook URL required',
        status: 'warning',
        duration: TOAST_DURATION.MEDIUM,
      });
      return;
    }

    setLoading(true);
    try {
      const payload = JSON.parse(webhookPayload);
      
      // Send test webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: 'Webhook test successful!',
          description: `Status: ${response.status}`,
          status: 'success',
          duration: TOAST_DURATION.MEDIUM,
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error: any) {
      toast({
        title: 'Webhook test failed',
        description: error.message,
        status: 'error',
        duration: TOAST_DURATION.LONG,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack spacing={8} align="stretch">
      <Box>
        <Heading size="2xl" mb={2} bgGradient="linear(to-r, brand.600, purple.400)" bgClip="text">
          Advanced Playground
        </Heading>
        <Text color="gray.500" fontSize="lg">
          Test advanced features: attachments, bulk notifications, webhooks, and scheduling
        </Text>
      </Box>

      <Tabs colorScheme="brand" size="lg" variant="enclosed">
        <TabList>
          <Tab>
            <HStack>
              <EmailIcon />
              <Text>Email + Attachments</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack>
              <RepeatIcon />
              <Text>Bulk Notifications</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack>
              <TimeIcon />
              <Text>Scheduled</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack>
              <LinkIcon />
              <Text>Webhook Test</Text>
            </HStack>
          </Tab>
        </TabList>

        <TabPanels>
          {/* Email with Attachments Tab */}
          <TabPanel>
            <Card shadow="lg" borderRadius="xl">
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Badge colorScheme="blue" fontSize="md" px={3} py={1} borderRadius="full" w="fit-content">
                    Email with Attachments
                  </Badge>

                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold">To</FormLabel>
                    <Input
                      type="email"
                      value={emailForm.to}
                      onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                    />
                  </FormControl>

                  <HStack spacing={4}>
                    <FormControl>
                      <FormLabel fontWeight="semibold">CC</FormLabel>
                      <Input
                        placeholder="email1@example.com, email2@example.com"
                        value={emailForm.cc}
                        onChange={(e) => setEmailForm({ ...emailForm, cc: e.target.value })}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="semibold">BCC</FormLabel>
                      <Input
                        placeholder="email@example.com"
                        value={emailForm.bcc}
                        onChange={(e) => setEmailForm({ ...emailForm, bcc: e.target.value })}
                      />
                    </FormControl>
                  </HStack>

                  <FormControl>
                    <FormLabel fontWeight="semibold">Reply-To</FormLabel>
                    <Input
                      type="email"
                      value={emailForm.replyTo}
                      onChange={(e) => setEmailForm({ ...emailForm, replyTo: e.target.value })}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold">Subject</FormLabel>
                    <Input
                      value={emailForm.subject}
                      onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold">Body</FormLabel>
                    <RichTextEditor
                      value={emailForm.body}
                      onChange={(value) => setEmailForm({ ...emailForm, body: value })}
                      height="250px"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="semibold">Attachments</FormLabel>
                    <Input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      accept="*/*"
                      display="none"
                      id="file-upload"
                    />
                    <Button
                      as="label"
                      htmlFor="file-upload"
                      leftIcon={<AddIcon />}
                      variant="outline"
                      cursor="pointer"
                    >
                      Add Files
                    </Button>
                    
                    {emailForm.attachments.length > 0 && (
                      <VStack align="stretch" mt={3} spacing={2}>
                        {emailForm.attachments.map((file, index) => (
                          <HStack key={index} p={2} borderWidth="1px" borderRadius="md">
                            <Text flex="1" fontSize="sm">{file.name} ({(file.size / 1024).toFixed(2)} KB)</Text>
                            <IconButton
                              aria-label="Remove"
                              icon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => removeAttachment(index)}
                            />
                          </HStack>
                        ))}
                      </VStack>
                    )}
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="semibold">Placeholders (JSON)</FormLabel>
                    <Textarea
                      value={emailForm.placeholders}
                      onChange={(e) => setEmailForm({ ...emailForm, placeholders: e.target.value })}
                      rows={3}
                      fontFamily="monospace"
                    />
                  </FormControl>

                  <Button
                    colorScheme="brand"
                    size="lg"
                    leftIcon={<EmailIcon />}
                    onClick={handleSendEmailWithAttachments}
                    isLoading={loading}
                  >
                    Send Email with Attachments
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Bulk Notifications Tab */}
          <TabPanel>
            <Card shadow="lg" borderRadius="xl">
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Badge colorScheme="purple" fontSize="md" px={3} py={1} borderRadius="full" w="fit-content">
                    Bulk Email Notifications
                  </Badge>

                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold">Template</FormLabel>
                    <Select
                      placeholder="Select template"
                      value={bulkTemplate}
                      onChange={(e) => setBulkTemplate(e.target.value)}
                      onFocus={() => loadTemplates('EMAIL')}
                    >
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="semibold">Subject Override (Optional)</FormLabel>
                    <Input
                      value={bulkSubject}
                      onChange={(e) => setBulkSubject(e.target.value)}
                      placeholder="Leave empty to use template subject"
                    />
                  </FormControl>

                  <Divider />

                  <HStack justify="space-between">
                    <Heading size="sm">Recipients ({bulkRecipients.length})</Heading>
                    <Button leftIcon={<AddIcon />} size="sm" onClick={addBulkRecipient}>
                      Add Recipient
                    </Button>
                  </HStack>

                  <Box maxH="400px" overflowY="auto">
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <Th>Email</Th>
                          <Th>Placeholders (JSON)</Th>
                          <Th></Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {bulkRecipients.map((recipient) => (
                          <Tr key={recipient.id}>
                            <Td>
                              <Input
                                size="sm"
                                type="email"
                                value={recipient.to}
                                onChange={(e) => updateBulkRecipient(recipient.id, 'to', e.target.value)}
                                placeholder="email@example.com"
                              />
                            </Td>
                            <Td>
                              <Input
                                size="sm"
                                value={recipient.placeholders}
                                onChange={(e) => updateBulkRecipient(recipient.id, 'placeholders', e.target.value)}
                                fontFamily="monospace"
                                placeholder='{"name": "John"}'
                              />
                            </Td>
                            <Td>
                              <IconButton
                                aria-label="Remove"
                                icon={<DeleteIcon />}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => removeBulkRecipient(recipient.id)}
                                isDisabled={bulkRecipients.length === 1}
                              />
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>

                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Text fontSize="sm">
                      Bulk notifications are queued and processed asynchronously. Check the Queue Monitor for status.
                    </Text>
                  </Alert>

                  <Button
                    colorScheme="purple"
                    size="lg"
                    leftIcon={<RepeatIcon />}
                    onClick={handleSendBulkEmail}
                    isLoading={loading}
                  >
                    Send Bulk Emails ({bulkRecipients.length})
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Scheduled Notifications Tab */}
          <TabPanel>
            <Card shadow="lg" borderRadius="xl">
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Badge colorScheme="orange" fontSize="md" px={3} py={1} borderRadius="full" w="fit-content">
                    Scheduled Notification
                  </Badge>

                  <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <Text fontSize="sm">
                      Feature coming soon! Scheduled notifications will be processed by the queue system.
                    </Text>
                  </Alert>

                  <FormControl>
                    <FormLabel fontWeight="semibold">Schedule Date & Time</FormLabel>
                    <Input
                      type="datetime-local"
                      value={scheduledForm.scheduleAt}
                      onChange={(e) => setScheduledForm({ ...scheduledForm, scheduleAt: e.target.value })}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="semibold">Timezone</FormLabel>
                    <Select
                      value={scheduledForm.timezone}
                      onChange={(e) => setScheduledForm({ ...scheduledForm, timezone: e.target.value })}
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Asia/Kolkata">India Standard Time</option>
                    </Select>
                  </FormControl>

                  <Button colorScheme="orange" size="lg" leftIcon={<TimeIcon />} isDisabled>
                    Schedule Notification (Coming Soon)
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Webhook Test Tab */}
          <TabPanel>
            <Card shadow="lg" borderRadius="xl">
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Badge colorScheme="green" fontSize="md" px={3} py={1} borderRadius="full" w="fit-content">
                    Webhook Testing
                  </Badge>

                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold">Webhook URL</FormLabel>
                    <Input
                      type="url"
                      placeholder="https://your-webhook-endpoint.com/webhook"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold">Payload (JSON)</FormLabel>
                    <Textarea
                      value={webhookPayload}
                      onChange={(e) => setWebhookPayload(e.target.value)}
                      rows={10}
                      fontFamily="monospace"
                    />
                  </FormControl>

                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Text fontSize="sm">
                      Test your webhook endpoints before configuring them in the system. This sends a POST request with your payload.
                    </Text>
                  </Alert>

                  <Button
                    colorScheme="green"
                    size="lg"
                    leftIcon={<LinkIcon />}
                    onClick={handleTestWebhook}
                    isLoading={loading}
                  >
                    Send Test Webhook
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

export default PlaygroundAdvanced;
