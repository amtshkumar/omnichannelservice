import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Button,
  useColorModeValue,
  Icon,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  IconButton,
  Divider,
} from '@chakra-ui/react';
import {
  EmailIcon,
  SettingsIcon,
  ViewIcon,
  ChevronDownIcon,
  HamburgerIcon,
  TimeIcon,
} from '@chakra-ui/icons';
import { AiOutlineHome } from 'react-icons/ai';
import { FiBarChart2 } from 'react-icons/fi';
import { RiTestTubeFill, RiRocketLine } from 'react-icons/ri';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue('white', 'gray.800');
  const sidebarBg = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const navItems = [
    { name: 'Overview', path: '/overview', icon: AiOutlineHome },
    { name: 'Playground', path: '/playground', icon: RiTestTubeFill },
    { name: 'Scheduled Emails', path: '/scheduled', icon: TimeIcon },
    { name: 'Analytics', path: '/analytics', icon: FiBarChart2 },
    { name: 'Queue Monitor', path: '/queues', icon: RiRocketLine },
    { name: 'Providers', path: '/providers', icon: SettingsIcon },
    { name: 'Templates', path: '/templates', icon: EmailIcon },
    { name: 'Outbox', path: '/outbox', icon: ViewIcon },
  ];

  const NavButton = ({ item, onClick }: any) => (
    <Button
      as={RouterLink}
      to={item.path}
      onClick={onClick}
      variant={location.pathname === item.path ? 'solid' : 'ghost'}
      colorScheme={location.pathname === item.path ? 'brand' : 'gray'}
      leftIcon={<Icon as={item.icon} />}
      justifyContent="flex-start"
      w="full"
      size="md"
    >
      {item.name}
    </Button>
  );

  return (
    <Flex minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* Sidebar - Desktop */}
      <Box
        display={{ base: 'none', lg: 'block' }}
        w="260px"
        bg={sidebarBg}
        borderRight="1px"
        borderColor={borderColor}
        position="fixed"
        h="100vh"
        overflowY="auto"
      >
        <VStack spacing={0} align="stretch" h="full">
          <Box p={6} borderBottom="1px" borderColor={borderColor}>
            <HStack spacing={3}>
              <Text fontSize="3xl">🔔</Text>
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="bold" color="brand.600">
                  Notification
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Service
                </Text>
              </VStack>
            </HStack>
          </Box>

          <VStack spacing={2} p={4} flex="1">
            {navItems.map((item) => (
              <NavButton key={item.path} item={item} />
            ))}
          </VStack>

          <Box p={4} borderTop="1px" borderColor={borderColor}>
            <Menu>
              <MenuButton as={Button} variant="ghost" w="full" size="md">
                <HStack>
                  <Avatar size="sm" name={`${user?.firstName} ${user?.lastName}`} />
                  <VStack spacing={0} align="start" flex="1">
                    <Text fontSize="sm" fontWeight="medium" isTruncated maxW="150px">
                      {user?.firstName} {user?.lastName}
                    </Text>
                    <Text fontSize="xs" color="gray.500" isTruncated maxW="150px">
                      {user?.email}
                    </Text>
                  </VStack>
                  <ChevronDownIcon />
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem>Profile</MenuItem>
                <MenuItem>Settings</MenuItem>
                <MenuDivider />
                <MenuItem onClick={logout} color="red.500">
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </Box>
        </VStack>
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <HStack spacing={3}>
              <Text fontSize="2xl">🔔</Text>
              <Text fontSize="lg" fontWeight="bold" color="brand.600">
                Notification Service
              </Text>
            </HStack>
          </DrawerHeader>
          <DrawerBody p={4}>
            <VStack spacing={2} align="stretch">
              {navItems.map((item) => (
                <NavButton key={item.path} item={item} onClick={onClose} />
              ))}
              <Divider my={4} />
              <Button onClick={logout} colorScheme="red" variant="ghost" w="full">
                Logout
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content Area */}
      <Flex direction="column" flex="1" ml={{ base: 0, lg: '260px' }}>
        {/* Top Bar - Mobile */}
        <Box
          display={{ base: 'block', lg: 'none' }}
          bg={bgColor}
          borderBottom="1px"
          borderColor={borderColor}
          px={4}
          py={3}
          position="sticky"
          top={0}
          zIndex={10}
        >
          <Flex justify="space-between" align="center">
            <HStack spacing={3}>
              <IconButton
                aria-label="Open menu"
                icon={<HamburgerIcon />}
                onClick={onOpen}
                variant="ghost"
              />
              <Text fontSize="xl" fontWeight="bold" color="brand.600">
                🔔 Notifications
              </Text>
            </HStack>
            <Avatar size="sm" name={`${user?.firstName} ${user?.lastName}`} />
          </Flex>
        </Box>

        {/* Main Content */}
        <Box flex="1" p={{ base: 4, md: 6, lg: 8 }} overflowY="auto">
          <Box maxW="1600px" mx="auto">
            <Outlet />
          </Box>
        </Box>

        {/* Footer */}
        <Box
          bg={bgColor}
          borderTop="1px"
          borderColor={borderColor}
          py={4}
          px={{ base: 4, md: 6, lg: 8 }}
        >
          <Text fontSize="sm" color="gray.500" textAlign="center">
            © 2024 Notification Service. All rights reserved.
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
};

export default Layout;
