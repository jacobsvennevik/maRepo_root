// Chakra Imports
import { Button, Icon, useColorMode } from "@chakra-ui/react";
// Custom Icons
import { IoMdMoon, IoMdSunny } from "react-icons/io";
import React from "react";

/**
 * @function FixedPlugin
 * @description A fixed button to toggle the app theme. It is placed at the bottom right of the screen.
 * @param {Object} props Component props
 * @returns {ReactElement} The button component
 */
export default function FixedPlugin(props) {
  const { ...rest } = props;
  const { colorMode, toggleColorMode } = useColorMode();
  let bgButton = "linear-gradient(135deg, #868CFF 0%, #4318FF 100%)";

  return (
    <Button
      // Pass the rest of the props to the button component
      {...rest}
      // Set the button height and width
      h='60px'
      w='60px'
      // Set the button background color
      bg={bgButton}
      // Set the button z-index to be on top of everything
      zIndex='99'
      // Set the button position to be fixed
      position='fixed'
      // Set the button variant to no-effects
      variant='no-effects'
      // Set the left and right properties based on the document direction
      left={document.documentElement.dir === "rtl" ? "35px" : ""}
      right={document.documentElement.dir === "rtl" ? "" : "35px"}
      // Set the bottom property to be 30px
      bottom='30px'
      // Set the border properties
      border='1px solid'
      borderColor='#6A53FF'
      borderRadius='50px'
      // Set the button onClick event to toggle the color mode
      onClick={toggleColorMode}
      // Set the button display to flex
      display='flex'
      // Set the button padding to 0px
      p='0px'
      // Set the button align and justify properties
      align='center'
      justify='center'>
      {/* Render the icon based on the color mode */}
      <Icon
        // Set the icon height and width
        h='24px'
        w='24px'
        // Set the icon color to white
        color='white'
        // Render the icon as IoMdMoon if the color mode is light
        // or IoMdSunny if the color mode is dark
        as={colorMode === "light" ? IoMdMoon : IoMdSunny}
      />
    </Button>
  );
}
