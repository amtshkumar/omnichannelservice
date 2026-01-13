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
import { footerAPI } from '../services/api';

const Footers = () => {
  const [footers, setFooters] = useState([]);
  const toast = useToast();

  useEffect(() => {
    loadFooters();
  }, []);

  const loadFooters = async () => {
    try {
      const response = await footerAPI.getAll();
      setFooters(response.data);
    } catch (error) {
      toast({ title: 'Failed to load footers', status: 'error', duration: 3000 });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await footerAPI.delete(id);
      toast({ title: 'Footer deleted', status: 'success', duration: 3000 });
      loadFooters();
    } catch (error) {
      toast({ title: 'Failed to delete', status: 'error', duration: 3000 });
    }
  };

  return (
    <VStack spacing={8} align="stretch">
      <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="2xl" mb={2} bgGradient="linear(to-r, brand.600, orange.400)" bgClip="text">
            Email Footers
          </Heading>
          <Text color="gray.500" fontSize="lg">
            Reusable email footer templates for consistent branding
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
          Add Footer
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
              {footers.map((footer: any) => (
                <Tr key={footer.id} _hover={{ bg: 'gray.50' }} transition="all 0.2s">
                  <Td fontWeight="semibold" fontSize="md">{footer.name}</Td>
                  <Td>
                    <Badge 
                      colorScheme={footer.isActive ? 'green' : 'red'} 
                      fontSize="sm" 
                      px={3} 
                      py={1} 
                      borderRadius="full"
                    >
                      {footer.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </Td>
                  <Td color="gray.600">{new Date(footer.createdAt).toLocaleDateString()}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton aria-label="Edit" icon={<EditIcon />} size="sm" colorScheme="blue" variant="ghost" />
                      <IconButton
                        aria-label="Delete"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDelete(footer.id)}
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

export default Footers;
