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
  HStack,
  IconButton,
  Card,
  CardBody,
  Select,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, ViewIcon } from '@chakra-ui/icons';
import { templateAPI } from '../services/api';
import RichTextEditor from '../components/RichTextEditor';
import { TOAST_DURATION } from '../constants/notifications';

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [channel, setChannel] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    channel: 'EMAIL',
    subject: '',
    body: '',
    isActive: true,
  });

  // Header and Footer content
  const [headerContent, setHeaderContent] = useState('<div style="background:#4F46E5;padding:20px;text-align:center;color:white;"><h1>{{companyName}}</h1></div>');
  const [footerContent, setFooterContent] = useState('<div style="background:#f3f4f6;padding:20px;text-align:center;color:#6b7280;font-size:12px;"><p>© 2024 {{companyName}}. All rights reserved.</p></div>');

  useEffect(() => {
    loadTemplates();
  }, [channel]);

  const loadTemplates = async () => {
    try {
      const response = await templateAPI.getAll(channel);
      setTemplates(response.data);
    } catch (error) {
      toast({ title: 'Failed to load templates', status: 'error', duration: TOAST_DURATION.MEDIUM });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await templateAPI.delete(id);
      toast({ title: 'Template deleted', status: 'success', duration: TOAST_DURATION.MEDIUM });
      loadTemplates();
    } catch (error) {
      toast({ title: 'Failed to delete', status: 'error', duration: TOAST_DURATION.MEDIUM });
    }
  };

  const handleEdit = async (template: any) => {
    try {
      const response = await templateAPI.getOne(template.id);
      const data = response.data;
      setEditingTemplate(data);
      setFormData({
        name: data.name,
        channel: data.channel,
        subject: data.subject || '',
        body: data.body,
        isActive: data.isActive,
      });
      onOpen();
    } catch (error) {
      toast({ title: 'Failed to load template', status: 'error', duration: TOAST_DURATION.MEDIUM });
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingTemplate) {
        await templateAPI.update(editingTemplate.id, formData);
        toast({ title: 'Template updated', status: 'success', duration: TOAST_DURATION.MEDIUM });
      } else {
        await templateAPI.create(formData);
        toast({ title: 'Template created', status: 'success', duration: TOAST_DURATION.MEDIUM });
      }
      loadTemplates();
      onClose();
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Operation failed',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: TOAST_DURATION.LONG,
      });
    }
  };

  const resetForm = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      channel: 'EMAIL',
      subject: '',
      body: '',
      isActive: true,
    });
  };

  const handleAddNew = () => {
    resetForm();
    onOpen();
  };

  return (
    <VStack spacing={8} align="stretch">
      <Box>
        <Heading size="2xl" mb={2} bgGradient="linear(to-r, brand.600, purple.400)" bgClip="text">
          Templates & Design
        </Heading>
        <Text color="gray.500" fontSize="lg">
          Manage templates, headers, and footers for your notifications
        </Text>
      </Box>

      <Tabs colorScheme="brand" variant="enclosed" size="lg">
        <TabList>
          <Tab fontWeight="semibold">📧 Templates</Tab>
          <Tab fontWeight="semibold">📄 Headers</Tab>
          <Tab fontWeight="semibold">🔖 Footers</Tab>
        </TabList>

        <TabPanels>
          {/* TEMPLATES TAB */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
        <HStack spacing={3}>
          <Select
            placeholder="All Channels"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            w="200px"
            size="lg"
            borderRadius="xl"
          >
            <option value="EMAIL">Email</option>
            <option value="SMS">SMS</option>
          </Select>
          <Button 
            leftIcon={<AddIcon />} 
            colorScheme="brand" 
            size="lg"
            shadow="md"
            _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
            transition="all 0.2s"
            onClick={handleAddNew}
          >
            Add Template
          </Button>
        </HStack>
      </Flex>

      <Card shadow="xl" borderRadius="xl" overflow="hidden">
        <CardBody p={0}>
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th fontSize="sm" textTransform="none" fontWeight="semibold">Name</Th>
                <Th fontSize="sm" textTransform="none" fontWeight="semibold">Channel</Th>
                <Th fontSize="sm" textTransform="none" fontWeight="semibold">Subject</Th>
                <Th fontSize="sm" textTransform="none" fontWeight="semibold">Status</Th>
                <Th fontSize="sm" textTransform="none" fontWeight="semibold">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {templates.map((template: any) => (
                <Tr key={template.id} _hover={{ bg: 'gray.50' }} transition="all 0.2s">
                  <Td fontWeight="semibold" fontSize="md">{template.name}</Td>
                  <Td>
                    <Badge colorScheme="blue" fontSize="sm" px={3} py={1} borderRadius="full">{template.channel}</Badge>
                  </Td>
                  <Td color="gray.600">{template.subject || '-'}</Td>
                  <Td>
                    <Badge 
                      colorScheme={template.isActive ? 'green' : 'red'} 
                      fontSize="sm" 
                      px={3} 
                      py={1} 
                      borderRadius="full"
                    >
                      {template.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton 
                        aria-label="View" 
                        icon={<ViewIcon />} 
                        size="sm" 
                        colorScheme="purple" 
                        variant="ghost" 
                      />
                      <IconButton 
                        aria-label="Edit" 
                        icon={<EditIcon />} 
                        size="sm" 
                        colorScheme="blue" 
                        variant="ghost"
                        onClick={() => handleEdit(template)}
                      />
                      <IconButton
                        aria-label="Delete"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDelete(template.id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {/* Add/Edit Template Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bgGradient="linear(to-r, brand.600, purple.400)" color="white" borderTopRadius="md">
            {editingTemplate ? 'Edit' : 'Add'} Template
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody pb={6} pt={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontWeight="semibold">Template Name</FormLabel>
                <Input
                  placeholder="Welcome Email"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="semibold">Channel</FormLabel>
                <Select
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                >
                  <option value="EMAIL">Email</option>
                  <option value="SMS">SMS</option>
                </Select>
              </FormControl>

              {formData.channel === 'EMAIL' && (
                <FormControl isRequired>
                  <FormLabel fontWeight="semibold">Subject</FormLabel>
                  <Input
                    placeholder="Welcome to {{company_name}}"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Use {'{{'} placeholder {'}}'}  for dynamic values
                  </Text>
                </FormControl>
              )}

              <FormControl isRequired>
                <FormLabel fontWeight="semibold">Body</FormLabel>
                <RichTextEditor
                  value={formData.body}
                  onChange={(value) => setFormData({ ...formData, body: value })}
                  placeholder="Hello {{name}}, welcome to our service!"
                  height="250px"
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Use {'{{'} placeholder {'}}'}  for dynamic values. Supports rich text formatting.
                </Text>
              </FormControl>

              <HStack w="full" justify="flex-end" spacing={3}>
                <Button onClick={onClose}>Cancel</Button>
                <Button colorScheme="brand" onClick={handleSubmit}>
                  {editingTemplate ? 'Update' : 'Create'}
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
            </VStack>
          </TabPanel>

          {/* HEADER DESIGNER TAB */}
          <TabPanel>
            <Card shadow="lg" borderRadius="xl">
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Box>
                    <Heading size="lg" mb={2}>Email Header Design</Heading>
                    <Text color="gray.500">
                      Design a single header that will be used across all email templates
                    </Text>
                  </Box>

                  <FormControl>
                    <FormLabel fontWeight="semibold">Header HTML Content</FormLabel>
                    <RichTextEditor
                      value={headerContent}
                      onChange={setHeaderContent}
                      height="300px"
                    />
                    <Text fontSize="xs" color="gray.500" mt={2}>
                      Use placeholders like {'{{companyName}}'}, {'{{logoUrl}}'}, etc.
                    </Text>
                  </FormControl>

                  <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
                    <Text fontWeight="semibold" mb={2}>Preview:</Text>
                    <Box
                      dangerouslySetInnerHTML={{ __html: headerContent }}
                      borderWidth="1px"
                      borderRadius="md"
                      bg="white"
                    />
                  </Box>

                  <HStack justify="flex-end">
                    <Button
                      colorScheme="brand"
                      size="lg"
                      onClick={() => {
                        // Save header logic here
                        toast({
                          title: 'Header saved successfully',
                          status: 'success',
                          duration: TOAST_DURATION.MEDIUM,
                        });
                      }}
                    >
                      Save Header
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* FOOTER DESIGNER TAB */}
          <TabPanel>
            <Card shadow="lg" borderRadius="xl">
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Box>
                    <Heading size="lg" mb={2}>Email Footer Design</Heading>
                    <Text color="gray.500">
                      Design a single footer that will be used across all email templates
                    </Text>
                  </Box>

                  <FormControl>
                    <FormLabel fontWeight="semibold">Footer HTML Content</FormLabel>
                    <RichTextEditor
                      value={footerContent}
                      onChange={setFooterContent}
                      height="300px"
                    />
                    <Text fontSize="xs" color="gray.500" mt={2}>
                      Use placeholders like {'{{companyName}}'}, {'{{address}}'}, {'{{unsubscribeUrl}}'}, etc.
                    </Text>
                  </FormControl>

                  <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
                    <Text fontWeight="semibold" mb={2}>Preview:</Text>
                    <Box
                      dangerouslySetInnerHTML={{ __html: footerContent }}
                      borderWidth="1px"
                      borderRadius="md"
                      bg="white"
                    />
                  </Box>

                  <HStack justify="flex-end">
                    <Button
                      colorScheme="brand"
                      size="lg"
                      onClick={() => {
                        // Save footer logic here
                        toast({
                          title: 'Footer saved successfully',
                          status: 'success',
                          duration: TOAST_DURATION.MEDIUM,
                        });
                      }}
                    >
                      Save Footer
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

export default Templates;
