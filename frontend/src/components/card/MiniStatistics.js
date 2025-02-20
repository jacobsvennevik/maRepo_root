// Chakra imports
// Chakra imports
import {
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
  Text,
} from "@chakra-ui/react";
// Custom components
import Card from "components/card/Card.js";
// Custom icons
import React from "react";

/**
 * Default is a functional component that displays a card with statistical information.
 * It includes a name, value, optional growth indicator, and additional start/end content.
 * @param {Object} props - The component props.
 * @param {ReactNode} props.startContent - Content to display at the start of the card.
 * @param {ReactNode} props.endContent - Content to display at the end of the card.
 * @param {string} props.name - The name or label for the statistic.
 * @param {string} props.growth - The growth percentage or value.
 * @param {string|number} props.value - The main value of the statistic.
 * @returns {JSX.Element} The rendered component.
 */
export default function Default(props) {
  const { startContent, endContent, name, growth, value } = props;

  // Define color values based on the current color mode
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = "secondaryGray.600";

  return (
    <Card py='15px'>
      <Flex
        my='auto'
        h='100%'
        align={{ base: "center", xl: "start" }}
        justify={{ base: "center", xl: "center" }}>
        {/* Render start content if provided */}
        {startContent}

        <Stat my='auto' ms={startContent ? "18px" : "0px"}>
          {/* Display the name or label for the statistic */}
          <StatLabel
            lineHeight='100%'
            color={textColorSecondary}
            fontSize={{
              base: "sm",
            }}>
            {name}
          </StatLabel>
          {/* Display the main value of the statistic */}
          <StatNumber
            color={textColor}
            fontSize={{
              base: "2xl",
            }}>
            {value}
          </StatNumber>
          {/* Optionally display growth information if provided */}
          {growth ? (
            <Flex align='center'>
              <Text color='green.500' fontSize='xs' fontWeight='700' me='5px'>
                {growth}
              </Text>
              <Text color='secondaryGray.600' fontSize='xs' fontWeight='400'>
                since last month
              </Text>
            </Flex>
          ) : null}
        </Stat>
        {/* Render end content if provided */}
        <Flex ms='auto' w='max-content'>
          {endContent}
        </Flex>
      </Flex>
    </Card>
  );
}
