import React from "react";

// Chakra imports
import { Flex, Box, Icon, Text, Spacer } from "@chakra-ui/react";
// Custom components
import Card from "components/card/Card.js";

// Assets
import bgMastercard from "assets/img/dashboards/Debit.png";
import { RiMastercardFill } from "react-icons/ri";

/**
 * Banner component
 * @param {Object} props - Component props
 * @param {String} props.exp - Expiration date of the card
 * @param {String} props.cvv - Card verification value
 * @param {String} props.number - Credit card number
 */
export default function Banner(props) {
  const { exp, cvv, number, ...rest } = props;

  // Chakra Color Mode
  return (
    <Card
      // Use a background image
      backgroundImage={bgMastercard}
      backgroundRepeat='no-repeat'
      bgSize='cover'
      alignSelf='center'
      // Adjust the width based on the screen size
      w={{ base: "100%", md: "60%", xl: "99%" }}
      // Adjust the position of the background image
      bgPosition='10%'
      // Add some margin to the card
      mx='auto'
      // Add some padding to the card
      p='20px'
      {...rest}>
      <Flex
        // Set the direction of the flex items
        direction='column'
        // Set the color of the text
        color='white'
        // Set the height of the flex container
        h='100%'
        // Set the width of the flex container
        w='100%'>
        <Flex
          // Set the justify content of the flex items
          justify='space-between'
          // Set the align items of the flex items
          align='center'
          // Add some margin to the bottom of the flex items
          mb='37px'>
          <Text
            // Set the font size of the text
            fontSize='2xl'
            // Set the font weight of the text
            fontWeight='bold'>
            Glassy.
          </Text>
          <Icon
            // Set the icon to use
            as={RiMastercardFill}
            // Set the width of the icon
            w='48px'
            // Set the height of the icon
            h='auto'
            // Set the color of the icon
            color='gray.400' />
        </Flex>
        <Spacer />
        <Flex direction='column'>
          <Box>
            <Text
              // Set the font size of the text
              fontSize={{ sm: "xl", lg: "lg", xl: "xl" }}
              // Set the font weight of the text
              fontWeight='bold'>
              {number}
            </Text>
          </Box>
          <Flex mt='14px'>
            <Flex direction='column' me='34px'>
              <Text
                // Set the font size of the text
                fontSize='xs'>
                VALID THRU
              </Text>
              <Text
                // Set the font size of the text
                fontSize='sm'
                // Set the font weight of the text
                fontWeight='500'>
                {exp}
              </Text>
            </Flex>
            <Flex direction='column'>
              <Text
                // Set the font size of the text
                fontSize='xs'>
                CVV
              </Text>
              <Text
                // Set the font size of the text
                fontSize='sm'
                // Set the font weight of the text
                fontWeight='500'>
                {cvv}
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
}
