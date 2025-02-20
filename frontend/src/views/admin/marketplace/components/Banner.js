import React from "react";

// Chakra imports
import { Button, Flex, Link, Text } from "@chakra-ui/react";

// Assets
import banner from "assets/img/nfts/NftBanner1.png";

/**
 * Component that renders the banner of the marketplace page.
 * @returns The component.
 */
export default function Banner() {
  // Chakra Color Mode
  return (
    <Flex
      direction='column'
      // Background image of the banner
      bgImage={banner}
      // Background size of the banner
      bgSize='cover'
      // Padding of the banner
      py={{ base: "30px", md: "56px" }}
      px={{ base: "30px", md: "64px" }}
      // Border radius of the banner
      borderRadius='30px'>
      <Text
        // Title of the banner
        fontSize={{ base: "24px", md: "34px" }}
        color='white'
        // Margin bottom of the title
        mb='14px'
        // Max width of the title
        maxW={{
          base: "100%",
          md: "64%",
          lg: "46%",
          xl: "70%",
          "2xl": "50%",
          "3xl": "42%",
        }}
        // Font weight of the title
        fontWeight='700'
        // Line height of the title
        lineHeight={{ base: "32px", md: "42px" }}>
        Discover, collect, and sell extraordinary NFTs
      </Text>
      <Text
        // Text of the banner
        fontSize='md'
        color='#E3DAFF'
        // Max width of the text
        maxW={{
          base: "100%",
          md: "64%",
          lg: "40%",
          xl: "56%",
          "2xl": "46%",
          "3xl": "34%",
        }}
        // Font weight of the text
        fontWeight='500'
        // Margin bottom of the text
        mb='40px'
        // Line height of the text
        lineHeight='28px'>
        Enter in this creative world. Discover now the latest NFTs or start
        creating your own!
      </Text>
      <Flex align='center'>
        <Button
          // Background color of the button
          bg='white'
          // Text color of the button
          color='black'
          // Background color of the button on hover
          _hover={{ bg: "whiteAlpha.900" }}
          // Background color of the button on active
          _active={{ bg: "white" }}
          // Background color of the button on focus
          _focus={{ bg: "white" }}
          // Font weight of the button
          fontWeight='500'
          // Font size of the button
          fontSize='14px'
          // Padding y of the button
          py='20px'
          // Padding x of the button
          px='27'
          // Margin end of the button
          me='38px'>
          Discover now
        </Button>
        <Link>
          <Text color='white' fontSize='sm' fontWeight='500'>
            Watch video
          </Text>
        </Link>
      </Flex>
    </Flex>
  );
}
