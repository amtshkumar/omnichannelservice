import { useEffect, useState } from 'react';
import {
  Box,
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Code,
  Flex,
} from '@chakra-ui/react';
import { ViewIcon } from '@chakra-ui/icons';
import { outboxAPI } from '../services/api';
import { TOAST_DURATION } from '../constants/notifications';
import { StatusBadge } from '../components/StatusBadge';
import { format } from 'date-fns';

const Outbox = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [filters, setFilters] = useState({ channel: '', status: '' });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    loadNotifications();
  }, [filters]);

  const loadNotifications = async () => {
    try {
      const response = await outboxAPI.getAll(filters);
      setNotifications(response.data);
    } catch (error) {
      toast({ title: 'Failed to load notifications', status: 'error', duration: TOAST_DURATION.MEDIUM });
    }
  };

  const handleView = async (id: number) => {
    try {
      const response = await outboxAPI.getOne(id);
      setSelectedNotification(response.data);
      onOpen();
    } catch (error) {
      toast({ title: 'Failed to load notification', status: 'error', duration: TOAST_DURATION.MEDIUM });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      PREVIEW: 'blue',
      QUEUED: 'yellow',
      SENT: 'green',
      FAILED: 'red',
    };
    return colors[status] || 'gray';
  };

  return (
    <VStack spacing={8} align="stretch">
      <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="2xl" mb={2} bgGradient="linear(to-r, brand.600, cyan.400)" bgClip="text">
            Outbox / Preview
          </Heading>
          <Text color="gray.500" fontSize="lg">
            View sent notifications and preview drafts
          </Text>
        </Box>
        <HStack spacing={3}>
          <Select
            placeholder="All Channels"
            value={filters.channel}
            onChange={(e) => setFilters({ ...filters, channel: e.target.value })}
            w="150px"
            size="lg"
            borderRadius="xl"
          >
            <option value="EMAIL">Email</option>
            <option value="SMS">SMS</option>
          </Select>
          <Select
            placeholder="All Status"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            w="150px"
            size="lg"
            borderRadius="xl"
          >
            <option value="PREVIEW">Preview</option>
            <option value="QUEUED">Queued</option>
            <option value="SENT">Sent</option>
            <option value="FAILED">Failed</option>
          </Select>
        </HStack>
      </Flex>

      <Card shadow="xl" borderRadius="xl" overflow="hidden">
        <CardBody p={0}>
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th fontSize="sm" textTransform="none" fontWeight="semibold">ID</Th>
                <Th fontSize="sm" textTransform="none" fontWeight="semibold">Channel</Th>
                <Th fontSize="sm" textTransform="none" fontWeight="semibold">Recipients</Th>
                <Th fontSize="sm" textTransform="none" fontWeight="semibold">Status</Th>
                <Th fontSize="sm" textTransform="none" fontWeight="semibold">Created</Th>
                <Th fontSize="sm" textTransform="none" fontWeight="semibold">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {notifications.map((notification: any) => (
                <Tr key={notification.id} _hover={{ bg: 'gray.50' }} transition="all 0.2s">
                  <Td fontWeight="semibold" color="brand.600">#{notification.id}</Td>
                  <Td>
                    <Badge colorScheme="blue" fontSize="sm" px={3} py={1} borderRadius="full">
                      {notification.channel}
                    </Badge>
                  </Td>
                  <Td fontSize="sm" color="gray.600">
                    {notification.recipients?.to?.join(', ') || notification.recipients?.to || '-'}
                  </Td>
                  <Td>
                    <Badge 
                      colorScheme={getStatusColor(notification.status)} 
                      fontSize="sm" 
                      px={3} 
                      py={1} 
                      borderRadius="full"
                    >
                      {notification.status}
                    </Badge>
                  </Td>
                  <Td color="gray.600">{format(new Date(notification.createdAt), 'MMM dd, yyyy HH:mm')}</Td>
                  <Td>
                    <IconButton
                      aria-label="View"
                      icon={<ViewIcon />}
                      size="sm"
                      colorScheme="purple"
                      variant="ghost"
                      onClick={() => handleView(notification.id)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Notification Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedNotification && (
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="bold">Channel:</Text>
                  <Badge colorScheme="blue">{selectedNotification.channel}</Badge>
                </Box>
                <Box>
                  <Text fontWeight="bold">Status:</Text>
                  <Badge colorScheme={getStatusColor(selectedNotification.status)}>
                    {selectedNotification.status}
                  </Badge>
                </Box>
                <Box>
                  <Text fontWeight="bold">Recipients:</Text>
                  <Code>{JSON.stringify(selectedNotification.recipients, null, 2)}</Code>
                </Box>
                <Box>
                  <Text fontWeight="bold">Rendered Content:</Text>
                  <Box
                    p={4}
                    bg="gray.50"
                    borderRadius="md"
                    maxH="400px"
                    overflowY="auto"
                    dangerouslySetInnerHTML={{ __html: selectedNotification.renderedContent }}
                  />
                </Box>
                {selectedNotification.errorMessage && (
                  <Box>
                    <Text fontWeight="bold" color="red.500">
                      Error:
                    </Text>
                    <Text color="red.600">{selectedNotification.errorMessage}</Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default Outbox;
