/*!
  _   _  ___  ____  ___ ________  _   _   _   _ ___   
 | | | |/ _ \|  _ \|_ _|__  / _ \| \ | | | | | |_ _| 
 | |_| | | | | |_) || |  / / | | |  \| | | | | || | 
 |  _  | |_| |  _ < | | / /| |_| | |\  | | |_| || |
 |_| |_|\___/|_| \_\___/____\___/|_| \_|  \___/|___|
                                                                                                                                                                                                                                                                                                                                       
=========================================================
* Horizon UI - v1.1.0
=========================================================

* Product Page: https://www.horizon-ui.com/
* Copyright 2022 Horizon UI (https://www.horizon-ui.com/)

* Designed and Coded by Simmmple

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

// Chakra imports
import {
  Avatar,
  Box,
  Flex,
  FormLabel,
  Icon,
  Select,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";
// Assets
import Usa from "assets/img/dashboards/usa.png";
// Custom components
import MiniCalendar from "components/calendar/MiniCalendar";
import MiniStatistics from "components/card/MiniStatistics";
import IconBox from "components/icons/IconBox";
import React from "react";
import {
  MdAddTask,
  MdAttachMoney,
  MdBarChart,
  MdFileCopy,
} from "react-icons/md";
import CheckTable from "views/admin/default/components/CheckTable";
import ComplexTable from "views/admin/default/components/ComplexTable";
import DailyTraffic from "views/admin/default/components/DailyTraffic";
import PieCard from "views/admin/default/components/PieCard";
import Tasks from "views/admin/default/components/Tasks";
import TotalSpent from "views/admin/default/components/TotalSpent";
import WeeklyRevenue from "views/admin/default/components/WeeklyRevenue";
import {
  columnsDataCheck,
  columnsDataComplex,
} from "views/admin/default/variables/columnsData";
import tableDataCheck from "views/admin/default/variables/tableDataCheck.json";
import tableDataComplex from "views/admin/default/variables/tableDataComplex.json";

/**
 * @function UserReports
 * @description A component that displays user reports in the admin dashboard.
 * @returns {JSX.Element} A JSX element containing the user reports.
 */

export default function UserReports() {
  // Chakra Color Mode
  const brandColor = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <SimpleGrid
        // The columns prop is used to define the number of columns
        // in the grid. It can be a number or an object with different
        // values for different breakpoints.
        columns={{ base: 1, md: 2, lg: 3, "2xl": 6 }}
        // The gap prop is used to define the gap between the items in
        // the grid. It can be a string or an object with different
        // values for different breakpoints.
        gap='20px'
        // The mb prop is used to define the margin bottom of the grid.
        mb='20px'
      >
        <MiniStatistics
          // The startContent prop is used to define the content at the
          // start of the component.
          startContent={
            <IconBox
              // The w prop is used to define the width of the component.
              w='56px'
              // The h prop is used to define the height of the component.
              h='56px'
              // The bg prop is used to define the background color of the
              // component.
              bg={boxBg}
              // The icon prop is used to define the icon of the component.
              icon={
                <Icon
                  // The w prop is used to define the width of the icon.
                  w='32px'
                  // The h prop is used to define the height of the icon.
                  h='32px'
                  // The as prop is used to define the icon component.
                  as={MdBarChart}
                  // The color prop is used to define the color of the icon.
                  color={brandColor}
                />
              }
            />
          }
          // The name prop is used to define the name of the component.
          name='Earnings'
          // The value prop is used to define the value of the component.
          value='$350.4'
        />
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon
                  w='32px'
                  h='32px'
                  as={MdAttachMoney}
                  color={brandColor}
                />
              }
            />
          }
          name='Spend this month'
          value='$642.39'
        />
        <MiniStatistics growth='+23%' name='Sales' value='$574.34' />
        <MiniStatistics
          endContent={
            <Flex me='-16px' mt='10px'>
              <FormLabel htmlFor='balance'>
                <Avatar src={Usa} />
              </FormLabel>
              <Select
                id='balance'
                variant='mini'
                mt='5px'
                me='0px'
                defaultValue='usd'
              >
                <option value='usd'>USD</option>
                <option value='eur'>EUR</option>
                <option value='gba'>GBA</option>
              </Select>
            </Flex>
          }
          name='Your balance'
          value='$1,000'
        />
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg='linear-gradient(90deg, #4481EB 0%, #04BEFE 100%)'
              icon={<Icon w='28px' h='28px' as={MdAddTask} color='white' />}
            />
          }
          name='New Tasks'
          value='154'
        />
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon
                  w='32px'
                  h='32px'
                  as={MdFileCopy}
                  color={brandColor}
                />
              }
            />
          }
          name='Total Projects'
          value='2935'
        />
      </SimpleGrid>

      <SimpleGrid
        columns={{ base: 1, md: 2, xl: 2 }}
        gap='20px'
        mb='20px'
      >
        <TotalSpent />
        <WeeklyRevenue />
      </SimpleGrid>
      <SimpleGrid
        columns={{ base: 1, md: 1, xl: 2 }}
        gap='20px'
        mb='20px'
      >
        <CheckTable
          // The columnsData prop is used to define the columns of the table.
          columnsData={columnsDataCheck}
          // The tableData prop is used to define the data of the table.
          tableData={tableDataCheck}
        />
        <SimpleGrid
          columns={{ base: 1, md: 2, xl: 2 }}
          gap='20px'
        >
          <DailyTraffic />
          <PieCard />
        </SimpleGrid>
      </SimpleGrid>
      <SimpleGrid
        columns={{ base: 1, md: 1, xl: 2 }}
        gap='20px'
        mb='20px'
      >
        <ComplexTable
          columnsData={columnsDataComplex}
          tableData={tableDataComplex}
        />
        <SimpleGrid
          columns={{ base: 1, md: 2, xl: 2 }}
          gap='20px'
        >
          <Tasks />
          <MiniCalendar
            // The h prop is used to define the height of the component.
            h='100%'
            // The minW prop is used to define the minimum width of the
            // component.
            minW='100%'
            // The selectRange prop is used to define whether the user can
            // select a range of dates.
            selectRange={false}
          />
        </SimpleGrid>
      </SimpleGrid>
    </Box>
  );
}
