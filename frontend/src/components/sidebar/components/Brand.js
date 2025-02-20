import React from "react";

// Chakra imports
import { Flex, useColorModeValue } from "@chakra-ui/react";

// Custom components
import { HorizonLogo } from "components/icons/Icons";
import { HSeparator } from "components/separator/Separator";

/**
 * SidebarBrand component
 * Component that renders the brand logo and a horizontal separator
 * Used in the sidebar component
 * @returns {ReactElement} - The SidebarBrand component
 */
export function SidebarBrand() {
  //   Chakra color mode
  //   When the color mode is light, the logo color is navy.700
  //   When the color mode is dark, the logo color is white
  const logoColor = useColorModeValue("navy.700", "white");

  return (
    <Flex align='center' direction='column'>
      {/* The brand logo */}
      <HorizonLogo h='26px' w='175px' my='32px' color={logoColor} />
      {/* A horizontal separator */}
      <HSeparator mb='20px' />
    </Flex>
  );
}

export default SidebarBrand;
