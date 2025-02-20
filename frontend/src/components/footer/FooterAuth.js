/*eslint-disable*/
import React from "react";
import {
  Flex,
  Link,
  List,
  ListItem,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

/**
 * Footer component
 * This component renders the footer section for the application.
 * It includes copyright information and navigation links.
 * @returns {ReactElement} The footer component
 */
export default function Footer() {
  // Determine text color based on the color mode
  let textColor = useColorModeValue("gray.400", "white");
  // Determine link color based on the color mode
  let linkColor = useColorModeValue({ base: "gray.400", lg: "white" }, "white");

  return (
    <Flex
      // Ensure the footer is above other elements
      zIndex='3'
      // Set layout direction based on screen size
      flexDirection={{
        base: "column",
        lg: "row",
      }}
      // Align items based on screen size
      alignItems={{
        base: "center",
        xl: "start",
      }}
      // Distribute space between elements
      justifyContent='space-between'
      // Set horizontal padding based on screen size
      px={{ base: "30px", md: "0px" }}
      // Set bottom padding
      pb='30px'>
      <Text
        // Apply text color
        color={textColor}
        // Align text based on screen size
        textAlign={{
          base: "center",
          xl: "start",
        }}
        // Set bottom margin based on screen size
        mb={{ base: "20px", lg: "0px" }}>
        &copy; {1900 + new Date().getYear()}
        <Text as='span' fontWeight='500' ms='4px'>
          <Link
            mx='3px'
            color={textColor}
            href='https://www.simmmple.com'
            target='_blank'
            fontWeight='700'>
            Simmmple!
          </Link>
          - Coded by 
          <Link
            mx='3px'
            color={textColor}
            href='https://appseed.us'
            target='_blank'>
            AppSeed
          </Link>
        </Text>
      </Text>
      <List display='flex'>
        {/** List of links */}
        <ListItem
          me={{
            base: "20px",
            md: "44px",
          }}>
          <Link
            fontWeight='500'
            color={linkColor}
            target='_blank'
            href='https://github.com/app-generator/react-horizon-ui-chakra'>
            Source Code
          </Link>
        </ListItem>
        <ListItem
          me={{
            base: "20px",
            md: "44px",
          }}>
          <Link
            fontWeight='500'
            color={linkColor}
            href='https://appseed.us/support/'>
            Support
          </Link>
        </ListItem>
        <ListItem
          me={{
            base: "20px",
            md: "44px",
          }}>
          <Link
            fontWeight='500'
            color={linkColor}
            href='https://simmmple.com/'>
            Simmmple
          </Link>
        </ListItem>
        <ListItem>
          <Link
            fontWeight='500'
            color={linkColor}
            href='https://appseed.us'>
            AppSeed
          </Link>
        </ListItem>
      </List>
    </Flex>
  );
}
