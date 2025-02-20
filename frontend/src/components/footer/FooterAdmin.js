/*eslint-disable*/
import React from "react";
import {
  Flex,
  Link,
  List,
  ListItem,
  Text,
  Button,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";

/**
 * FooterAdmin component
 * A footer component for the admin layout
 * @returns {ReactElement} The footer component
 */
export default function FooterAdmin() {
  const textColor = useColorModeValue("gray.400", "white");
  const { toggleColorMode } = useColorMode();
  return (
    <Flex
      // set the z-index to 3 to make sure the footer is always on top
      // of other elements
      zIndex='3'
      // set the flex direction to column on small screens
      // and to row on larger screens
      flexDirection={{
        base: "column",
        xl: "row",
      }}
      // center the elements vertically on small screens
      // and align them to the start on larger screens
      alignItems={{
        base: "center",
        xl: "start",
      }}
      // set the justify content to space between
      justifyContent='space-between'
      // set the padding to 30px on small screens
      // and to 50px on larger screens
      px={{ base: "30px", md: "50px" }}
      // set the padding bottom to 30px
      pb='30px'>
      <Text
        // set the color of the text
        color={textColor}
        // set the text align to center on small screens
        // and to start on larger screens
        textAlign={{
          base: "center",
          xl: "start",
        }}
        // set the margin bottom to 20px on small screens
        // and to 0px on larger screens
        mb={{ base: "20px", xl: "0px" }}>
        {" "}
        &copy; {1900 + new Date().getYear()}
        <Text as='span' fontWeight='500' ms='4px'>
          <Link
            // set the margin to 3px
            mx='3px'
            // set the color of the link
            color={textColor}
            // set the target to _blank to open the link in a new tab
            target='_blank'
            // set the href to the link
            href='https://www.simmmple.com'>
            Simmmple
          </Link> 
          - Coded by 
          <Link
            // set the margin to 3px
            mx='3px'
            // set the color of the link
            color={textColor}
            // set the target to _blank to open the link in a new tab
            target='_blank'
            // set the href to the link
            href='https://appseed.us'>
            AppSeed
          </Link> 
        </Text>
      </Text>
      <List display='flex'>
      <ListItem
          // set the margin to 20px on small screens
          // and to 44px on larger screens
          me={{
            base: "20px",
            md: "44px",
          }}>
          <Link
            // set the font weight to 500
            fontWeight='500'
            // set the color of the link
            color={textColor}
            // set the target to _blank to open the link in a new tab
            target='_blank'
            // set the href to the link
            href='https://github.com/app-generator/react-horizon-ui-chakra'>
            Source Code
          </Link>
        </ListItem>        
        <ListItem
          // set the margin to 20px on small screens
          // and to 44px on larger screens
          me={{
            base: "20px",
            md: "44px",
          }}>
          <Link
            // set the font weight to 500
            fontWeight='500'
            // set the color of the link
            color={textColor}
            // set the target to _blank to open the link in a new tab
            target='_blank'
            // set the href to the link
            href='https://appseed.us/support/'>
            Support
          </Link>
        </ListItem>
      </List>
    </Flex>
  );
}
