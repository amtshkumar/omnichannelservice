import { useState, useEffect } from 'react';
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { TimeIcon, DeleteIcon, EditIcon, AddIcon, ViewIcon } from '@chakra-ui/icons';
import { notificationAPI, templateAPI } from '../services/api';
import RichTextEditor from '../components/RichTextEditor';
import { TIMEZONES } from '../constants/timezones';
import { STATUS_COLORS, TOAST_DURATION } from '../constants/notifications';
import { extractEmailData, formatEmailForEdit, generateIdempotencyKey } from '../utils/scheduledEmailHelpers';
import { StatusBadge } from '../components/StatusBadge';
import { TableSkeleton } from '../components/TableSkeleton';
import { Pagination } from '../components/Pagination';
import { EmptyState } from '../components/EmptyState';
import { PageCard } from '../components/PageCard';
import { usePagination } from '../hooks/usePagination';

interface ScheduledEmail {
  id: number;
  channel: string;
  recipients: { to: string[]; cc?: string[]; bcc?: string[] };
  payload: any;
  renderedContent: string;
  status: string;
  templateId?: number;
  createdAt: string;
  updatedAt: string;
}

const ScheduledEmails = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([]);
  const [editingScheduledId, setEditingScheduledId] = useState<string | null>(null);
  const [viewingEmail, setViewingEmail] = useState<ScheduledEmail | null>(null);
  
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  const [scheduledForm, setScheduledForm] = useState({
    to: '',
    subject: '',
    body: '',
    templateId: '',
    placeholders: '{}',
    scheduleAt: '',
    timezone: 'UTC',
  });

  useEffect(() => {
    loadTemplates();
    loadScheduledEmails();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await templateAPI.getAll('EMAIL');
      setTemplates(response.data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const loadScheduledEmails = async () => {
    try {
      const response = await notificationAPI.getScheduled({ channel: 'EMAIL' });
      console.log('Loaded scheduled emails:', response.data); // Debug log
      setScheduledEmails(response.data);
    } catch (error) {
      console.error('Failed to load scheduled emails:', error);
      toast({
        title: 'Failed to load scheduled emails',
        description: 'Could not fetch scheduled emails from server',
        status: 'error',
        duration: TOAST_DURATION.MEDIUM,
      });
    }
  };

  const handleTemplateSelect = async (templateId: string) => {
    if (!templateId) {
      setScheduledForm({ ...scheduledForm, templateId: '', subject: '', body: '' });
      return;
    }

    setLoading(true);
    try {
      const response = await templateAPI.getOne(parseInt(templateId));
      const template = response.data;
      
      setScheduledForm({
        ...scheduledForm,
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
    } catch (error: any) {
      toast({
        title: 'Failed to load template',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: TOAST_DURATION.MEDIUM,
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
        duration: TOAST_DURATION.MEDIUM,
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
      };

      if (scheduledForm.templateId) {
        payload.templateId = parseInt(scheduledForm.templateId);
      }

      // Add timezone to payload
      payload.timezone = scheduledForm.timezone;

      if (editingScheduledId) {
        // Update existing
        await notificationAPI.updateScheduled(parseInt(editingScheduledId), payload);
        toast({
          title: 'Email updated!',
          description: `Will be sent at ${scheduleDate.toLocaleString()}`,
          status: 'success',
          duration: TOAST_DURATION.LONG,
        });
      } else {
        // Create new
        await notificationAPI.scheduleEmail(payload);
        toast({
          title: 'Email scheduled successfully!',
          description: `Will be sent at ${scheduleDate.toLocaleString()}`,
          status: 'success',
          duration: TOAST_DURATION.LONG,
        });
      }

      // Reload the list from database
      await loadScheduledEmails();
      
      resetForm();
      onFormClose();
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

  const handleEditScheduledEmail = (email: ScheduledEmail) => {
    // Use utility function for data extraction (DRY principle)
    const formData = formatEmailForEdit(email);
    
    console.log('Editing email:', { email, formData }); // Debug log
    
    setScheduledForm(formData);
    setEditingScheduledId(email.id.toString());
    onFormOpen();
  };

  const handleDeleteScheduledEmail = async (id: number) => {
    try {
      await notificationAPI.deleteScheduled(id);
      
      toast({
        title: 'Scheduled email cancelled',
        status: 'success',
        duration: TOAST_DURATION.SHORT,
      });
      
      // Reload the list
      await loadScheduledEmails();
    } catch (error: any) {
      toast({
        title: 'Failed to delete scheduled email',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: TOAST_DURATION.MEDIUM,
      });
    }
  };

  const handleViewEmail = (email: ScheduledEmail) => {
    setViewingEmail(email);
    onViewOpen();
  };

  const resetForm = () => {
    setScheduledForm({
      to: '',
      subject: '',
      body: '',
      templateId: '',
      placeholders: '{}',
      scheduleAt: '',
      timezone: 'UTC',
    });
    setEditingScheduledId(null);
  };

  const handleNewEmail = () => {
    resetForm();
    onFormOpen();
  };

  return (
    <VStack spacing={6} align="stretch" p={6}>
      <HStack justify="space-between">
        <Box>
          <Heading size="lg" mb={2}>Scheduled Emails</Heading>
          <Text color="gray.600">
            Manage and monitor your scheduled email notifications
          </Text>
        </Box>
        <Button
          colorScheme="cyan"
          leftIcon={<AddIcon />}
          onClick={handleNewEmail}
          size="lg"
        >
          Schedule New Email
        </Button>
      </HStack>

      {/* Statistics */}
      <HStack spacing={4}>
        <Card flex={1}>
          <CardBody>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.600">Total Scheduled</Text>
              <Heading size="lg">{scheduledEmails.length}</Heading>
            </VStack>
          </CardBody>
        </Card>
        <Card flex={1}>
          <CardBody>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.600">Pending</Text>
              <Heading size="lg" color="yellow.500">
                {scheduledEmails.filter(e => e.status === 'QUEUED').length}
              </Heading>
            </VStack>
          </CardBody>
        </Card>
        <Card flex={1}>
          <CardBody>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.600">Sent</Text>
              <Heading size="lg" color="green.500">
                {scheduledEmails.filter(e => e.status === 'SENT').length}
              </Heading>
            </VStack>
          </CardBody>
        </Card>
        <Card flex={1}>
          <CardBody>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.600">Failed</Text>
              <Heading size="lg" color="red.500">
                {scheduledEmails.filter(e => e.status === 'FAILED').length}
              </Heading>
            </VStack>
          </CardBody>
        </Card>
      </HStack>

      {/* Scheduled Emails Table */}
      <Card shadow="lg" borderRadius="xl">
        <CardBody>
          {scheduledEmails.length === 0 ? (
            <VStack spacing={4} py={12}>
              <TimeIcon boxSize={12} color="gray.400" />
              <Heading size="md" color="gray.600">No Scheduled Emails</Heading>
              <Text color="gray.500">Schedule your first email to get started</Text>
              <Button colorScheme="cyan" leftIcon={<AddIcon />} onClick={handleNewEmail}>
                Schedule Email
              </Button>
            </VStack>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>To</Th>
                  <Th>Subject</Th>
                  <Th>Scheduled At</Th>
                  <Th>Status</Th>
                  <Th>Created</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {scheduledEmails.map((email) => {
                  // Use utility function for data extraction (DRY principle)
                  const { toEmails, subject, scheduleAt, timezone } = extractEmailData(email);
                  
                  return (
                    <Tr key={email.id}>
                      <Td>{toEmails.join(', ')}</Td>
                      <Td maxW="250px" isTruncated>{subject || 'N/A'}</Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm">
                            {scheduleAt ? new Date(scheduleAt).toLocaleString() : 'N/A'}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {timezone}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <StatusBadge status={email.status} />
                      </Td>
                      <Td>
                        <Text fontSize="sm" color="gray.600">
                          {new Date(email.createdAt).toLocaleDateString()}
                        </Text>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="View email"
                            icon={<ViewIcon />}
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => handleViewEmail(email)}
                          />
                          <IconButton
                            aria-label="Edit email"
                            icon={<EditIcon />}
                            size="sm"
                            colorScheme="orange"
                            variant="ghost"
                            onClick={() => handleEditScheduledEmail(email)}
                            isDisabled={email.status !== 'QUEUED'}
                          />
                          <IconButton
                            aria-label="Delete email"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleDeleteScheduledEmail(email.id)}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                  );
                })}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Schedule/Edit Email Modal */}
      <Modal isOpen={isFormOpen} onClose={onFormClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingScheduledId ? 'Edit Scheduled Email' : 'Schedule New Email'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontWeight="semibold">Use Template (Optional)</FormLabel>
                <Select
                  placeholder="Select a template or compose custom email"
                  value={scheduledForm.templateId}
                  onChange={(e) => {
                    setScheduledForm({ ...scheduledForm, templateId: e.target.value });
                    if (e.target.value) {
                      handleTemplateSelect(e.target.value);
                    }
                  }}
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
                  Scheduled emails are stored locally and will attempt to sync with the API when available.
                </Text>
              </Alert>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => {
              resetForm();
              onFormClose();
            }}>
              Cancel
            </Button>
            <Button
              colorScheme="cyan"
              leftIcon={<TimeIcon />}
              onClick={handleScheduleEmail}
              isLoading={loading}
            >
              {editingScheduledId ? 'Update Email' : 'Schedule Email'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Email Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Email Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {viewingEmail && (() => {
              const payload = viewingEmail.payload || {};
              const recipients = viewingEmail.recipients || { to: [] };
              return (
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontWeight="semibold" fontSize="sm" color="gray.600">To</Text>
                    <Text>{recipients.to.join(', ')}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="semibold" fontSize="sm" color="gray.600">Subject</Text>
                    <Text>{payload.subject || 'N/A'}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="semibold" fontSize="sm" color="gray.600">Body</Text>
                    <Box
                      p={3}
                      bg="gray.50"
                      borderRadius="md"
                      dangerouslySetInnerHTML={{ __html: viewingEmail.renderedContent || payload.body || 'N/A' }}
                    />
                  </Box>
                  <Box>
                    <Text fontWeight="semibold" fontSize="sm" color="gray.600">Placeholders</Text>
                    <Box p={3} bg="gray.50" borderRadius="md" fontFamily="monospace" fontSize="sm">
                      {JSON.stringify(payload.placeholders || {}, null, 2)}
                    </Box>
                  </Box>
                  <HStack>
                    <Box flex={1}>
                      <Text fontWeight="semibold" fontSize="sm" color="gray.600">Scheduled At</Text>
                      <Text>{payload.scheduleAt ? new Date(payload.scheduleAt).toLocaleString() : 'N/A'}</Text>
                      <Text fontSize="xs" color="gray.500">{payload.timezone || 'UTC'}</Text>
                    </Box>
                    <Box flex={1}>
                      <Text fontWeight="semibold" fontSize="sm" color="gray.600">Status</Text>
                      <Badge
                        colorScheme={
                          viewingEmail.status === 'QUEUED' ? 'yellow' :
                          viewingEmail.status === 'SENT' ? 'green' : 'red'
                        }
                      >
                        {viewingEmail.status}
                      </Badge>
                    </Box>
                  </HStack>
                </VStack>
              );
            })()}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onViewClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default ScheduledEmails;
