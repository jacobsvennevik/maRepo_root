import React from "react";

// Chakra imports
import {
  Icon,
  Flex,
  Text,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
  useColorModeValue,
} from "@chakra-ui/react";
// Assets
import {
  MdOutlineMoreHoriz,
  MdOutlinePerson,
  MdOutlineCardTravel,
  MdOutlineLightbulb,
  MdOutlineSettings,
} from "react-icons/md";

const bgHover = { bg: "gray.100" };
const bgFocus = { bg: "gray.200" };

/**
 * A functional component that renders a menu with four options.
 * @param {object} props - The props object.
 * @param {string} props.variant - The variant of the menu.
 * @param {string} props.color - The color of the menu.
 * @param {string} props.bg - The background color of the menu.
 * @param {string} props.bgShadow - The shadow color of the menu.
 * @param {string} props.textHover - The color of the text when hovered.
 * @param {string} props.iconColor - The color of the icon.
 * @param {string} props.bgList - The background color of the menu list.
 * @param {string} props.bgButton - The background color of the menu button.
 * @returns {JSX.Element} The rendered component.
 */
export default function Banner(props) {
  const { variant, color, bg, bgShadow, textHover, iconColor, bgList, bgButton, ...rest } = props;

  const textColor = useColorModeValue("secondaryGray.500", "white");

  // Ellipsis modals
  const {
    isOpen: isOpen1,
    onOpen: onOpen1,
    onClose: onClose1,
  } = useDisclosure();

  return (
    <Menu isOpen={isOpen1} onClose={onClose1}>
      <MenuButton
        align='center'
        justifyContent='center'
        bg={bgButton}
        _hover={bgHover}
        _focus={bgFocus}
        _active={bgFocus}
        w='37px'
        h='37px'
        lineHeight='100%'
        onClick={onOpen1}
        borderRadius='10px'
        {...rest}>
        <Icon as={MdOutlineMoreHoriz} color={iconColor} w='24px' h='24px' />
      </MenuButton>
      <MenuList
        w='150px'
        minW='unset'
        maxW='150px !important'
        border='transparent'
        backdropFilter='blur(63px)'
        bg={bgList}
        boxShadow={bgShadow}
        borderRadius='20px'
        p='15px'>
        <MenuItem
          transition='0.2s linear'
          color={textColor}
          _hover={textHover}
          p='0px'
          borderRadius='8px'
          _active={{
            bg: "transparent",
          }}
          _focus={{
            bg: "transparent",
          }}
          mb='10px'>
          <Flex align='center'>
            <Icon as={MdOutlinePerson} h='16px' w='16px' me='8px' />
            <Text fontSize='sm' fontWeight='400'>
              Panel 1
            </Text>
          </Flex>
        </MenuItem>
        <MenuItem
          transition='0.2s linear'
          p='0px'
          borderRadius='8px'
          color={textColor}
          _hover={textHover}
          _active={{
            bg: "transparent",
          }}
          _focus={{
            bg: "transparent",
          }}
          mb='10px'>
          <Flex align='center'>
            <Icon as={MdOutlineCardTravel} h='16px' w='16px' me='8px' />
            <Text fontSize='sm' fontWeight='400'>
              Panel 2
            </Text>
          </Flex>
        </MenuItem>
        <MenuItem
          transition='0.2s linear'
          p='0px'
          borderRadius='8px'
          color={textColor}
          _hover={textHover}
          _active={{
            bg: "transparent",
          }}
          _focus={{
            bg: "transparent",
          }}
          mb='10px'>
          <Flex align='center'>
            <Icon as={MdOutlineLightbulb} h='16px' w='16px' me='8px' />
            <Text fontSize='sm' fontWeight='400'>
              Panel 3
            </Text>
          </Flex>
        </MenuItem>
        <MenuItem
          transition='0.2s linear'
          color={textColor}
          _hover={textHover}
          p='0px'
          borderRadius='8px'
          _active={{
            bg: "transparent",
          }}
          _focus={{
            bg: "transparent",
          }}>
          <Flex align='center'>
            <Icon as={MdOutlineSettings} h='16px' w='16px' me='8px' />
            <Text fontSize='sm' fontWeight='400'>
              Panel 4
            </Text>
          </Flex>
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
