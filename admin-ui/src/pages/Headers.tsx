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
  Flex,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { headerAPI } from '../services/api';

const Headers = () => {
  const [headers, setHeaders] = useState([]);
  const toast = useToast();

  useEffect(() => {
    loadHeaders();
  }, []);

  const loadHeaders = async () => {
    try {
      const response = await headerAPI.getAll();
      setHeaders(response.data);
    } catch (error) {
      toast({ title: 'Failed to load headers', status: 'error', duration: 3000 });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await headerAPI.delete(id);
      toast({ title: 'Header deleted', status: 'success', duration: 3000 });
      loadHeaders();
    } catch (error) {
      toast({ title: 'Failed to delete', status: 'error', duration: 3000 });
    }
  };

  return (
    <VStack spacing={8} align="stretch">
      <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="2xl" mb={2} bgGradient="linear(to-r, brand.600, green.400)" bgClip="text">
            Email Headers
          </Heading>
          <Text color="gray.500" fontSize="lg">
            Reusable email header templates for consistent branding
          </Text>
        </Box>
        <Button 
          leftIcon={<AddIcon />} 
          colorScheme="brand" 
          size="lg"
          shadow="md"
          _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
          transition="all 0.2s"
        >
          Add Header
        </Button>
      </Flex>

      <Card shadow="xl" borderRadius="xl" overflow="hidden">
        <CardBody p={0}>
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th fontSize="sm" textTransform="none" fontWeight="semibold">Name</Th>
                <Th fontSize="sm" textTransform="none" fontWeight="semibold">Status</Th>
                <Th fontSize="sm" textTransform="none" fontWeight="semibold">Created</Th>
                <Th fontSize="sm" textTransform="none" fontWeight="semibold">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {headers.map((header: any) => (
                <Tr key={header.id} _hover={{ bg: 'gray.50' }} transition="all 0.2s">
                  <Td fontWeight="semibold" fontSize="md">{header.name}</Td>
                  <Td>
                    <Badge 
                      colorScheme={header.isActive ? 'green' : 'red'} 
                      fontSize="sm" 
                      px={3} 
                      py={1} 
                      borderRadius="full"
                    >
                      {header.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </Td>
                  <Td color="gray.600">{new Date(header.createdAt).toLocaleDateString()}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton aria-label="Edit" icon={<EditIcon />} size="sm" colorScheme="blue" variant="ghost" />
                      <IconButton
                        aria-label="Delete"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDelete(header.id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default Headers;
