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
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import { EmailIcon, PhoneIcon, AddIcon, DeleteIcon, TimeIcon, RepeatIcon, LinkIcon } from '@chakra-ui/icons';
import { notificationAPI, templateAPI } from '../services/api';
import RichTextEditor from '../components/RichTextEditor';
import { TIMEZONES } from '../constants/timezones';
import { TOAST_DURATION } from '../constants/notifications';
import { generateIdempotencyKey } from '../utils/scheduledEmailHelpers';

interface BulkRecipient {
  id: string;
  to: string;
  placeholders: string;
}

const Playground = () => {
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

  // Single SMS Form
  const [smsForm, setSmsForm] = useState({
    to: '',
    body: '',
    templateId: '',
    placeholders: '{}',
  });

  // Bulk Email Form
  const [bulkRecipients, setBulkRecipients] = useState<BulkRecipient[]>([
    { id: '1', to: '', placeholders: '{}' },
  ]);
  const [bulkTemplate, setBulkTemplate] = useState('');
  const [bulkSubject, setBulkSubject] = useState('');

  // Scheduled Email Form
  const [scheduledForm, setScheduledForm] = useState({
    to: '',
    subject: '',
    body: '',
    templateId: '',
    placeholders: '{}',
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
          duration: TOAST_DURATION.SHORT,
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
          duration: TOAST_DURATION.SHORT,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Failed to load template',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: TOAST_DURATION.LONG,
      });
      setSelectedTemplate(null);
    } finally {
      setLoading(false);
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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSendEmail = async () => {
    if (!emailForm.to || !emailForm.subject || !emailForm.body) {
      toast({
        title: 'Missing required fields',
        status: 'warning',
        duration: TOAST_DURATION.LONG,
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
            content: base64.split(',')[1],
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
        duration: TOAST_DURATION.LONG,
      });

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
      setSelectedTemplate(null);
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

  const handleSendSMS = async () => {
    if (!smsForm.to || !smsForm.body) {
      toast({
        title: 'Missing required fields',
        status: 'warning',
        duration: TOAST_DURATION.LONG,
      });
      return;
    }

    setLoading(true);
    try {
      const placeholders = JSON.parse(smsForm.placeholders);

      const payload: any = {
        idempotencyKey: generateIdempotencyKey('sms'),
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
        duration: TOAST_DURATION.LONG,
      });

      setSmsForm({
        to: '',
        body: '',
        templateId: '',
        placeholders: '{}',
      });
      setSelectedTemplate(null);
    } catch (error: any) {
      toast({
        title: 'Failed to send SMS',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: TOAST_DURATION.LONG,
      });
    } finally {
      setLoading(false);
    }
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
        duration: TOAST_DURATION.LONG,
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
        duration: TOAST_DURATION.LONG,
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

  const handleScheduleEmail = async () => {
    if (!scheduledForm.to || !scheduledForm.subject || !scheduledForm.body || !scheduledForm.scheduleAt) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all required fields including schedule time',
        status: 'warning',
        duration: TOAST_DURATION.LONG,
      });
      return;
    }

    setLoading(true);
    try {
      const placeholders = JSON.parse(scheduledForm.placeholders);
      const scheduleDate = new Date(scheduledForm.scheduleAt);

      if (scheduleDate <= new Date()) {
        toast({
          title: 'Invalid schedule time',
          description: 'Schedule time must be in the future',
          status: 'warning',
          duration: TOAST_DURATION.MEDIUM,
        });
        setLoading(false);
        return;
      }

      const payload: any = {
        idempotencyKey: generateIdempotencyKey('scheduled'),
        to: [scheduledForm.to],
        subject: scheduledForm.subject,
        body: scheduledForm.body,
        placeholders,
        scheduleAt: scheduleDate.toISOString(),
        timezone: scheduledForm.timezone,
      };

      if (scheduledForm.templateId) {
        payload.templateId = parseInt(scheduledForm.templateId);
      }

      await notificationAPI.scheduleEmail(payload);
      
      toast({
        title: 'Email scheduled successfully!',
        description: `Will be sent at ${scheduleDate.toLocaleString()}`,
        status: 'success',
        duration: TOAST_DURATION.LONG,
      });

      setScheduledForm({
        to: '',
        subject: '',
        body: '',
        templateId: '',
        placeholders: '{}',
        scheduleAt: '',
        timezone: 'UTC',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to schedule email',
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
        duration: TOAST_DURATION.LONG,
      });
      return;
    }

    setLoading(true);
    try {
      const payload = JSON.parse(webhookPayload);
      
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
          Notification Playground
        </Heading>
        <Text color="gray.500" fontSize="lg">
          Test all notification features: single, bulk, attachments, webhooks, and more
        </Text>
      </Box>

      <Tabs colorScheme="brand" size="lg" variant="enclosed">
        <TabList flexWrap="wrap">
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
          <Tab>
            <HStack>
              <RepeatIcon />
              <Text>Bulk Email</Text>
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
              <Text>Webhook</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack>
              <Code fontSize="sm">API</Code>
            </HStack>
          </Tab>
        </TabList>

        <TabPanels>
          {/* EMAIL TAB */}
          <TabPanel>
            <Card shadow="lg" borderRadius="xl">
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Badge colorScheme="blue" fontSize="md" px={3} py={1} borderRadius="full" w="fit-content">
                    Send Email
                  </Badge>

                  <FormControl>
                    <FormLabel fontWeight="semibold">Use Template (Optional)</FormLabel>
                    <Select
                      placeholder="Select a template or compose custom email"
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
                      placeholder="reply@example.com"
                      value={emailForm.replyTo}
                      onChange={(e) => setEmailForm({ ...emailForm, replyTo: e.target.value })}
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
                      size="sm"
                    >
                      Add Files
                    </Button>
                    
                    {emailForm.attachments.length > 0 && (
                      <VStack align="stretch" mt={3} spacing={2}>
                        {emailForm.attachments.map((file, index) => (
                          <HStack key={index} p={2} borderWidth="1px" borderRadius="md" bg="gray.50">
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
                      placeholder='{"firstName": "John", "companyName": "Acme Inc"}'
                      value={emailForm.placeholders}
                      onChange={(e) => setEmailForm({ ...emailForm, placeholders: e.target.value })}
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
                          cc: '',
                          bcc: '',
                          replyTo: '',
                          subject: '',
                          body: '',
                          templateId: '',
                          placeholders: '{}',
                          attachments: [],
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
                          You can modify placeholders before sending
                        </Text>
                      </Box>
                    </Alert>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* SMS TAB */}
          <TabPanel>
            <Card shadow="lg" borderRadius="xl">
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Badge colorScheme="purple" fontSize="md" px={3} py={1} borderRadius="full" w="fit-content">
                    Send SMS
                  </Badge>

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
                      value={smsForm.placeholders}
                      onChange={(e) => setSmsForm({ ...smsForm, placeholders: e.target.value })}
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
                          placeholders: '{}',
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
                          You can modify placeholders before sending
                        </Text>
                      </Box>
                    </Alert>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* BULK EMAIL TAB */}
          <TabPanel>
            <Card shadow="lg" borderRadius="xl">
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Badge colorScheme="orange" fontSize="md" px={3} py={1} borderRadius="full" w="fit-content">
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

                  <Box maxH="400px" overflowY="auto" borderWidth="1px" borderRadius="md">
                    <Table size="sm">
                      <Thead bg="gray.50" position="sticky" top={0}>
                        <Tr>
                          <Th>Email</Th>
                          <Th>Placeholders (JSON)</Th>
                          <Th w="50px"></Th>
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
                    colorScheme="orange"
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

          {/* SCHEDULED EMAIL TAB */}
          <TabPanel>
            <Card shadow="lg" borderRadius="xl">
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Badge colorScheme="cyan" fontSize="md" px={3} py={1} borderRadius="full" w="fit-content">
                    Schedule Email for Later
                  </Badge>

                  <FormControl>
                    <FormLabel fontWeight="semibold">Use Template (Optional)</FormLabel>
                    <Select
                      placeholder="Select a template or compose custom email"
                      value={scheduledForm.templateId}
                      onChange={(e) => {
                        setScheduledForm({ ...scheduledForm, templateId: e.target.value });
                        if (e.target.value) {
                          handleTemplateSelect(e.target.value, 'EMAIL');
                        }
                      }}
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
                      value={scheduledForm.to}
                      onChange={(e) => setScheduledForm({ ...scheduledForm, to: e.target.value })}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold">Subject</FormLabel>
                    <Input
                      placeholder="Email subject"
                      value={scheduledForm.subject}
                      onChange={(e) => setScheduledForm({ ...scheduledForm, subject: e.target.value })}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold">Body</FormLabel>
                    <RichTextEditor
                      value={scheduledForm.body}
                      onChange={(value) => setScheduledForm({ ...scheduledForm, body: value })}
                      placeholder="Enter email content..."
                      height="250px"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="semibold">Placeholders (JSON)</FormLabel>
                    <Textarea
                      placeholder='{"firstName": "John", "companyName": "Acme Inc"}'
                      value={scheduledForm.placeholders}
                      onChange={(e) => setScheduledForm({ ...scheduledForm, placeholders: e.target.value })}
                      rows={3}
                      fontFamily="monospace"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold">Schedule Date & Time</FormLabel>
                    <Input
                      type="datetime-local"
                      value={scheduledForm.scheduleAt}
                      onChange={(e) => setScheduledForm({ ...scheduledForm, scheduleAt: e.target.value })}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Select the date and time when the email should be sent
                    </Text>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold">Timezone</FormLabel>
                    <Select
                      value={scheduledForm.timezone}
                      onChange={(e) => setScheduledForm({ ...scheduledForm, timezone: e.target.value })}
                    >
                      {TIMEZONES.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </Select>
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Email will be sent according to the selected timezone
                    </Text>
                  </FormControl>

                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Text fontSize="sm">
                      Scheduled emails are added to the queue with a delay. Check the Queue Monitor to see scheduled jobs.
                    </Text>
                  </Alert>

                  <Divider />

                  <HStack justify="space-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setScheduledForm({
                          to: '',
                          subject: '',
                          body: '',
                          templateId: '',
                          placeholders: '{}',
                          scheduleAt: '',
                          timezone: 'UTC',
                        });
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      colorScheme="cyan"
                      size="lg"
                      leftIcon={<TimeIcon />}
                      onClick={handleScheduleEmail}
                      isLoading={loading}
                    >
                      Schedule Email
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* WEBHOOK TAB */}
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

          {/* API EXAMPLES TAB */}
          <TabPanel>
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

                  <Box>
                    <Text fontWeight="semibold" mb={2}>Send Bulk Email (cURL)</Text>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm">
{`curl -X POST http://localhost:3000/api/v1/notifications/bulk/email \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "notifications": [
      {
        "idempotencyKey": "bulk-1",
        "to": ["user1@example.com"],
        "templateId": 1,
        "placeholders": {"name": "John"}
      },
      {
        "idempotencyKey": "bulk-2",
        "to": ["user2@example.com"],
        "templateId": 1,
        "placeholders": {"name": "Jane"}
      }
    ]
  }'`}
                    </Code>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

export default Playground;
