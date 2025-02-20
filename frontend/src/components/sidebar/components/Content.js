// chakra imports
import { Box, Flex, Stack } from "@chakra-ui/react";
//   Custom components
import Brand from "components/sidebar/components/Brand";
import Links from "components/sidebar/components/Links";
import SidebarCard from "components/sidebar/components/SidebarCard";
import React from "react";

// FUNCTIONS

/**
 * SidebarContent
 * Component that renders the content of the sidebar
 * @param {Object} props - props object
 * @param {Array} props.routes - array of routes
 * @returns {ReactElement} - SidebarContent component
 */
function SidebarContent(props) {
  const { routes } = props;

  // SIDEBAR
  // The main container of the sidebar
  return (
    <Flex direction='column' height='100%' pt='25px' borderRadius='30px'>
      <Brand />
      <Stack direction='column' mb='auto' mt='8px'>
        <Box ps='20px' pe={{ md: "16px", "2xl": "1px" }}>
          {/* Render the links of the sidebar */}
          <Links routes={routes} />
        </Box>
      </Stack>

      <Box
        ps='20px'
        pe={{ md: "16px", "2xl": "0px" }}
        mt='60px'
        mb='40px'
        borderRadius='30px'>
        {/* Render the card of the sidebar */}
        <SidebarCard />
      </Box>
    </Flex>
  );
}

export default SidebarContent;
