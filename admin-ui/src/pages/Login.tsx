import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Card,
  CardBody,
  Flex,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  Icon,
  Stack,
  Divider,
} from '@chakra-ui/react';
import { EmailIcon, LockIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const bgGradient = useColorModeValue(
    'linear(to-br, brand.50, purple.50)',
    'linear(to-br, gray.900, gray.800)'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast({
        title: 'Welcome back! 🎉',
        description: 'Login successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.response?.data?.message || 'Invalid credentials',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bgGradient={bgGradient} p={4}>
      <Container maxW="md">
        <VStack spacing={8}>
          {/* Logo and Title */}
          <VStack spacing={3}>
            <Box
              bg="brand.500"
              p={4}
              borderRadius="2xl"
              shadow="xl"
              transform="rotate(-5deg)"
              transition="all 0.3s"
              _hover={{ transform: 'rotate(0deg) scale(1.05)' }}
            >
              <Text fontSize="5xl">🔔</Text>
            </Box>
            <Heading
              size="2xl"
              bgGradient="linear(to-r, brand.600, purple.600)"
              bgClip="text"
              textAlign="center"
            >
              Notification Service
            </Heading>
            <Text color="gray.600" fontSize="lg" fontWeight="medium">
              Admin Dashboard
            </Text>
          </VStack>

          {/* Login Card */}
          <Card w="full" bg={bgColor} shadow="2xl" borderRadius="2xl" overflow="hidden">
            <CardBody p={8}>
              <form onSubmit={handleSubmit}>
                <VStack spacing={6}>
                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold">Email Address</FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement>
                        <Icon as={EmailIcon} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@notification.local"
                        borderRadius="xl"
                        focusBorderColor="brand.500"
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold">Password</FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement>
                        <Icon as={LockIcon} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        borderRadius="xl"
                        focusBorderColor="brand.500"
                      />
                    </InputGroup>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    w="full"
                    isLoading={loading}
                    loadingText="Signing in..."
                    borderRadius="xl"
                    shadow="lg"
                    _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                    transition="all 0.2s"
                  >
                    Sign In
                  </Button>
                </VStack>
              </form>
            </CardBody>
          </Card>

          {/* Default Credentials Info */}
          <Card w="full" bg={useColorModeValue('blue.50', 'gray.700')} borderRadius="xl">
            <CardBody>
              <VStack spacing={2}>
                <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                  🔑 Default Credentials
                </Text>
                <Divider />
                <Stack spacing={1} w="full">
                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm" color="gray.600">
                      Email:
                    </Text>
                    <Text fontSize="sm" fontFamily="mono" fontWeight="medium">
                      admin@notification.local
                    </Text>
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm" color="gray.600">
                      Password:
                    </Text>
                    <Text fontSize="sm" fontFamily="mono" fontWeight="medium">
                      Admin@123
                    </Text>
                  </Flex>
                </Stack>
              </VStack>
            </CardBody>
          </Card>

          {/* Footer */}
          <Text fontSize="sm" color="gray.500" textAlign="center">
            © 2024 Notification Service. All rights reserved.
          </Text>
        </VStack>
      </Container>
    </Flex>
  );
};

export default Login;
