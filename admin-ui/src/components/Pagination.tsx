import { HStack, Button, Text, Select, IconButton } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <HStack justify="space-between" w="full" py={4} flexWrap="wrap" gap={4}>
      <HStack spacing={2}>
        <Text fontSize="sm" color="gray.600">
          Showing {startItem} to {endItem} of {totalItems} results
        </Text>
      </HStack>

      <HStack spacing={4}>
        <HStack spacing={2}>
          <Text fontSize="sm" color="gray.600">
            Rows per page:
          </Text>
          <Select
            size="sm"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            w="80px"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </Select>
        </HStack>

        <HStack spacing={1}>
          <IconButton
            aria-label="Previous page"
            icon={<ChevronLeftIcon />}
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            isDisabled={currentPage === 1}
            variant="ghost"
          />

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <Button
                key={pageNum}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                colorScheme={currentPage === pageNum ? 'brand' : 'gray'}
                variant={currentPage === pageNum ? 'solid' : 'ghost'}
              >
                {pageNum}
              </Button>
            );
          })}

          <IconButton
            aria-label="Next page"
            icon={<ChevronRightIcon />}
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            isDisabled={currentPage === totalPages}
            variant="ghost"
          />
        </HStack>
      </HStack>
    </HStack>
  );
};
