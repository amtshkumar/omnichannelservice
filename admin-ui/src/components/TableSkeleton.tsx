import { Skeleton, Tr, Td, Table, Thead, Tbody, Th } from '@chakra-ui/react';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  headers?: string[];
}

export const TableSkeleton = ({ rows = 5, columns = 5, headers }: TableSkeletonProps) => {
  return (
    <Table variant="simple">
      {headers && (
        <Thead>
          <Tr>
            {headers.map((header, index) => (
              <Th key={index}>{header}</Th>
            ))}
          </Tr>
        </Thead>
      )}
      <Tbody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <Tr key={rowIndex}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Td key={colIndex}>
                <Skeleton height="20px" />
              </Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};
