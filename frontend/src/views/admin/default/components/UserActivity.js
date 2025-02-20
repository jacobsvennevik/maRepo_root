// Chakra imports
import { Box, Flex, Select, Text, useColorModeValue } from "@chakra-ui/react";
import Card from "components/card/Card.js";
// Custom components
import BarChart from "components/charts/BarChart";
import React from "react";
import {
  barChartDataUserActivity,
  barChartOptionsUserActivity,
} from "variables/charts";

/**
 * UserActivity component displays user activity statistics with a bar chart.
 *
 * @param {Object} props - The properties passed to the component.
 * @returns {JSX.Element} The rendered UserActivity component.
 */
export default function UserActivity(props) {
  const { ...rest } = props;

  // Determine text color based on color mode
  const textColor = useColorModeValue("secondaryGray.900", "white");

  return (
    <Card align='center' direction='column' w='100%' {...rest}>
      <Flex align='center' w='100%' px='15px' py='10px'>
        <Text
          me='auto'
          color={textColor}
          fontSize='xl'
          fontWeight='700'
          lineHeight='100%'>
          User Activity
        </Text>
        {/* Dropdown to select the time period for user activity */}
        <Select
          id='user_type'
          w='unset'
          variant='transparent'
          display='flex'
          alignItems='center'
          defaultValue='Weekly'>
          <option value='Weekly'>Weekly</option>
          <option value='Daily'>Daily</option>
          <option value='Monthly'>Monthly</option>
        </Select>
      </Flex>

      {/* Bar chart displaying user activity data */}
      <Box h='240px' mt='auto'>
        <BarChart
          chartData={barChartDataUserActivity}
          chartOptions={barChartOptionsUserActivity}
        />
      </Box>
    </Card>
  );
}
