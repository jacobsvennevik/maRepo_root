// Chakra imports
import { Box, Text, useColorModeValue } from "@chakra-ui/react";
// Custom components
import Card from "components/card/Card.js";
import React from "react";

/**
 * Information component displays a card with a title and value text.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.title - The title text to display.
 * @param {string} props.value - The value text to display.
 * @returns {JSX.Element} The rendered Information component.
 */
export default function Information(props) {
  const { title, value, ...rest } = props;

  // Chakra Color Mode
  const textColorPrimary = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = "gray.400";
  const bg = useColorModeValue("white", "navy.700");

  return (
    // Card component with background color based on color mode
    <Card bg={bg} {...rest}>
      <Box>
        {/* Title text */}
        <Text fontWeight='500' color={textColorSecondary} fontSize='sm'>
          {title}
        </Text>
        {/* Value text */}
        <Text color={textColorPrimary} fontWeight='500' fontSize='md'>
          {value}
        </Text>
      </Box>
    </Card>
  );
}
