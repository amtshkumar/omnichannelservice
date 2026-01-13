import {
  VStack,
  Card,
  CardBody,
  Heading,
  Text,
  Code,
  Box,
  Badge,
  HStack,
  Alert,
  AlertIcon,
  Divider,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { useApiDocs, ApiExample, ApiAttribute } from '../hooks/useApiDocs';

const ApiExampleCard = ({ example, color }: { example: ApiExample; color: string }) => {
  return (
    <Card shadow="lg" borderRadius="xl" borderLeft="4px" borderColor={`${color}.500`}>
      <CardBody>
        <Heading size="md" mb={4} color={`${color}.600`}>
          {example.title}
        </Heading>
        <VStack spacing={4} align="stretch">
          <Box>
            <Text fontWeight="semibold" mb={2}>
              {example.description}
            </Text>
            <HStack spacing={2} mb={2}>
              <Badge colorScheme={color}>{example.method}</Badge>
              <Code fontSize="sm">{example.endpoint}</Code>
              {example.requiresAuth && <Badge colorScheme="red">Requires Auth</Badge>}
            </HStack>
          </Box>

          <Box>
            <Text fontWeight="semibold" mb={2}>
              cURL Command:
            </Text>
            <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" bg="gray.50">
              {example.curl}
            </Code>
          </Box>

          {example.attributes && (
            <Box>
              <Text fontWeight="bold" mb={2} color={`${color}.600`}>
                📝 Attribute Meanings:
              </Text>
              <VStack align="stretch" spacing={2} fontSize="sm">
                {Object.entries(example.attributes).map(([key, attr]: [string, ApiAttribute]) => (
                  <HStack key={key}>
                    <Badge colorScheme={attr.required ? color : 'green'}>{key}</Badge>
                    <Text>
                      {attr.description} {attr.required ? '(required)' : '(optional)'}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
          )}

          {example.notes && (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Text fontSize="sm">{example.notes}</Text>
            </Alert>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export const ApiDocumentation = () => {
  const { docs, loading, error } = useApiDocs();

  if (loading) {
    return (
      <Center py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading API documentation...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <VStack align="start" spacing={1}>
          <Text fontWeight="bold">Failed to load API documentation</Text>
          <Text fontSize="sm">{error}</Text>
        </VStack>
      </Alert>
    );
  }

  if (!docs) {
    return null;
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Authentication */}
      <ApiExampleCard example={docs.authentication} color="purple" />

      {/* Send Email */}
      <ApiExampleCard example={docs.sendEmail} color="blue" />

      {/* Schedule Email */}
      <ApiExampleCard example={docs.scheduleEmail} color="cyan" />

      {/* Send SMS */}
      <ApiExampleCard example={docs.sendSms} color="green" />

      {/* Bulk Email */}
      <ApiExampleCard example={docs.bulkEmail} color="orange" />

      {/* Response Formats */}
      <Card shadow="lg" borderRadius="xl" borderLeft="4px" borderColor="purple.500">
        <CardBody>
          <Heading size="md" mb={4} color="purple.600">
            {docs.responseFormats.title}
          </Heading>
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontWeight="semibold" mb={2}>
                Success Response ({docs.responseFormats.success.statusCode}):
              </Text>
              <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" bg="green.50">
                {JSON.stringify(docs.responseFormats.success.example, null, 2)}
              </Code>
            </Box>
            <Box>
              <Text fontWeight="semibold" mb={2}>
                Error Response ({docs.responseFormats.error.statusCode}):
              </Text>
              <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" bg="red.50">
                {JSON.stringify(docs.responseFormats.error.example, null, 2)}
              </Code>
            </Box>
            <Box>
              <Text fontWeight="bold" mb={2} color="purple.600">
                📝 Response Attributes:
              </Text>
              <VStack align="stretch" spacing={2} fontSize="sm">
                {Object.entries(docs.responseFormats.success.attributes).map(([key, description]) => (
                  <HStack key={key}>
                    <Badge colorScheme="purple">{key}</Badge>
                    <Text>{description as string}</Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Quick Reference */}
      <Card shadow="lg" borderRadius="xl" bg="gradient-to-r" bgGradient="linear(to-r, blue.50, purple.50)">
        <CardBody>
          <Heading size="md" mb={4}>
            🚀 Quick Reference
          </Heading>
          <VStack align="stretch" spacing={3} fontSize="sm">
            <HStack>
              <Badge colorScheme="blue">Base URL</Badge>
              <Code>{docs.quickReference.baseUrl}</Code>
            </HStack>
            <HStack>
              <Badge colorScheme="green">Swagger Docs</Badge>
              <Code>{docs.quickReference.swaggerDocs}</Code>
            </HStack>
            <HStack>
              <Badge colorScheme="orange">Bull Board</Badge>
              <Code>{docs.quickReference.bullBoard}</Code>
            </HStack>
            <HStack>
              <Badge colorScheme="purple">Default Credentials</Badge>
              <Code>
                {docs.quickReference.defaultCredentials.email} / {docs.quickReference.defaultCredentials.password}
              </Code>
            </HStack>
          </VStack>
          <Divider my={4} />
          <Text fontWeight="bold" mb={2}>
            💡 Pro Tips:
          </Text>
          <VStack align="stretch" spacing={1} fontSize="xs" color="gray.700">
            {docs.quickReference.tips.map((tip, index) => (
              <Text key={index}>• {tip}</Text>
            ))}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};
