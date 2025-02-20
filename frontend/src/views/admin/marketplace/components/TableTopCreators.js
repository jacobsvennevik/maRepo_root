import {
  Avatar,
  Box,
  Button,
  Flex,
  Progress,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useMemo } from "react";
import {
  useGlobalFilter,
  usePagination,
  useSortBy,
  useTable,
} from "react-table";

/**
 * @description A component that renders a table for top creators.
 * @param {Object} props - The props object.
 * @param {Array} props.columnsData - The columns of the table.
 * @param {Array} props.tableData - The data of the table.
 * @returns {ReactElement} The rendered component.
 */
function TopCreatorTable(props) {
  const { columnsData, tableData } = props;

  // Memoize the columns and data to optimize performance.
  const columns = useMemo(() => columnsData, [columnsData]);
  const data = useMemo(() => tableData, [tableData]);

  // Create an instance of the table with necessary plugins.
  const tableInstance = useTable(
    {
      columns,
      data,
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  // Destructure table instance properties for ease of use.
  const { getTableProps, getTableBodyProps, headerGroups, page, prepareRow } =
    tableInstance;

  // Define color modes for text and borders.
  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = useColorModeValue("secondaryGray.600", "white");

  return (
    // Render the component.
    <>
      <Flex
        // Set the direction of the component.
        direction='column'
        // Set the width of the component.
        w='100%'
        // Set the overflow of the component.
        overflowX={{ sm: "scroll", lg: "hidden" }}
      >
        <Flex
          // Set the alignment of the component.
          align={{ sm: "flex-start", lg: "center" }}
          // Set the justification of the component.
          justify='space-between'
          // Set the width of the component.
          w='100%'
          // Set the padding of the component.
          px='22px'
          // Set the padding bottom of the component.
          pb='20px'
          // Set the margin bottom of the component.
          mb='10px'
          // Set the box shadow of the component.
          boxShadow='0px 40px 58px -20px rgba(112, 144, 176, 0.26)'
        >
          <Text
            // Set the color of the text.
            color={textColor}
            // Set the font size of the text.
            fontSize='xl'
            // Set the font weight of the text.
            fontWeight='600'
          >
            Top Creators
          </Text>
          <Button variant='action'>See all</Button>
        </Flex>
        <Table
          // Set the props of the table.
          {...getTableProps()}
          // Set the variant of the table.
          variant='simple'
          // Set the color of the table.
          color='gray.500'
        >
          <Thead>
            {headerGroups.map((headerGroup, index) => (
              <Tr
                // Set the props of the row.
                {...headerGroup.getHeaderGroupProps()}
                // Set the key of the row.
                key={index}
              >
                {headerGroup.headers.map((column, index) => (
                  <Th
                    // Set the props of the cell.
                    {...column.getHeaderProps(
                      column.getSortByToggleProps()
                    )}
                    // Set the padding end of the cell.
                    pe='10px'
                    // Set the key of the cell.
                    key={index}
                    // Set the border color of the cell.
                    borderColor='transparent'
                  >
                    <Flex
                      // Set the justification of the cell.
                      justify='space-between'
                      // Set the alignment of the cell.
                      align='center'
                      // Set the font size of the cell.
                      fontSize={{ sm: "10px", lg: "12px" }}
                      // Set the color of the cell.
                      color='gray.400'
                    >
                      {column.render("Header")}
                    </Flex>
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>

          <Tbody {...getTableBodyProps()}>
            {page.map((row, index) => {
              prepareRow(row);
              return (
                <Tr {...row.getRowProps()} key={index}>
                  {row.cells.map((cell, index) => {
                    let data = "";
                    if (cell.column.Header === "Name") {
                      data = (
                        <Flex align='center'>
                          <Avatar
                            // Set the source of the avatar.
                            src={cell.value[1]}
                            // Set the width of the avatar.
                            w='30px'
                            // Set the height of the avatar.
                            h='30px'
                            // Set the margin end of the avatar.
                            me='8px'
                          />
                          <Text
                            // Set the color of the text.
                            color={textColor}
                            // Set the font size of the text.
                            fontSize='sm'
                            // Set the font weight of the text.
                            fontWeight='600'
                          >
                            {cell.value[0]}
                          </Text>
                        </Flex>
                      );
                    } else if (cell.column.Header === "Artworks") {
                      data = (
                        <Text
                          // Set the color of the text.
                          color={textColorSecondary}
                          // Set the font size of the text.
                          fontSize='sm'
                          // Set the font weight of the text.
                          fontWeight='500'
                        >
                          {cell.value}
                        </Text>
                      );
                    } else if (cell.column.Header === "Rating") {
                      data = (
                        <Box>
                          <Progress
                            // Set the variant of the progress.
                            variant='table'
                            // Set the color scheme of the progress.
                            colorScheme='brandScheme'
                            // Set the value of the progress.
                            value={cell.value}
                          />
                        </Box>
                      );
                    }
                    return (
                      <Td
                        // Set the props of the cell.
                        {...cell.getCellProps()}
                        // Set the key of the cell.
                        key={index}
                        // Set the font size of the cell.
                        fontSize={{ sm: "14px" }}
                        // Set the min width of the cell.
                        minW={{ sm: "150px", md: "200px", lg: "auto" }}
                        // Set the border color of the cell.
                        borderColor='transparent'
                      >
                        {data}
                      </Td>
                    );
                  })}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Flex>
    </>
  );
}

export default TopCreatorTable;
