import React from "react";

// Chakra imports
import { Box, Flex, Icon, Text, useColorModeValue } from "@chakra-ui/react";
import BarChart from "components/charts/BarChart";

// Custom components
import Card from "components/card/Card.js";
import {
  barChartDataDailyTraffic,
  barChartOptionsDailyTraffic,
} from "variables/charts";

// Assets
import { RiArrowUpSFill } from "react-icons/ri";

/**
 * DailyTraffic component displays a card with daily traffic stats and a bar chart.
 * 
 * @param {Object} props - The properties passed to the component.
 * @returns {JSX.Element} The rendered DailyTraffic component.
 */
export default function DailyTraffic(props) {
  // Destructure the rest of the properties
  const { ...rest } = props;

  // Determine text color based on color mode
  const textColor = useColorModeValue("secondaryGray.900", "white");

  return (
    <Card align='center' direction='column' w='100%' {...rest}>
      <Flex justify='space-between' align='start' px='10px' pt='5px'>
        <Flex flexDirection='column' align='start' me='20px'>
          {/* Title of the card */}
          <Text color='secondaryGray.600' fontSize='sm' fontWeight='500'>
            Daily Traffic
          </Text>
          <Flex align='end'>
            {/* Display daily traffic count */}
            <Text
              color={textColor}
              fontSize='34px'
              fontWeight='700'
              lineHeight='100%'>
              2.579
            </Text>
            {/* Label for the count */}
            <Text
              ms='6px'
              color='secondaryGray.600'
              fontSize='sm' 
              fontWeight='500'>
              Visitors
            </Text>
          </Flex>
        </Flex>
        <Flex align='center'>
          {/* Icon indicating increase */}
          <Icon as={RiArrowUpSFill} color='green.500' />
          {/* Percentage indicating traffic increase */}
          <Text color='green.500' fontSize='sm' fontWeight='700'>
            +2.45%
          </Text>
        </Flex>
      </Flex>
      {/* Bar chart displaying daily traffic data */}
      <Box h='240px' mt='auto'>
        <BarChart
          chartData={barChartDataDailyTraffic}
          chartOptions={barChartOptionsDailyTraffic}
        />
      </Box>
    </Card>
  );
}
