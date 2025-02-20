// Chakra imports
import {
  Box,
  Flex,
  Text,
  Icon,
  useColorModeValue,
  Checkbox,
} from "@chakra-ui/react";
// Custom components
import Card from "components/card/Card.js";
import Menu from "components/menu/MainMenu";
import IconBox from "components/icons/IconBox";

// Assets
import { MdCheckBox, MdDragIndicator } from "react-icons/md";
import React from "react";

/**
 * Conversion component renders a list of tasks with checkboxes
 * and draggable icons, using Chakra UI components for styling.
 * 
 * @param {Object} props - The properties passed to the component.
 * @returns {JSX.Element} The Conversion component.
 */
export default function Conversion(props) {
  const { ...rest } = props;

  // Chakra Color Mode settings
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "navy.700");
  const brandColor = useColorModeValue("brand.500", "brand.400");
  
  return (
    <Card p='20px' align='center' direction='column' w='100%' {...rest}>
      <Flex alignItems='center' w='100%' mb='30px'>
        {/* Icon box with checkbox icon */}
        <IconBox
          me='12px'
          w='38px'
          h='38px'
          bg={boxBg}
          icon={<Icon as={MdCheckBox} color={brandColor} w='24px' h='24px' />}
        />

        {/* Title text */}
        <Text color={textColor} fontSize='lg' fontWeight='700'>
          Tasks
        </Text>
        {/* Menu component */}
        <Menu ms='auto' />
      </Flex>
      <Box px='11px'>
        {/* Task items with checkboxes */}
        <Flex mb='20px'>
          <Checkbox me='16px' colorScheme='brandScheme' />
          <Text
            fontWeight='bold'
            color={textColor}
            fontSize='md'
            textAlign='start'>
            Landing Page Design
          </Text>
          <Icon
            ms='auto'
            as={MdDragIndicator}
            color='secondaryGray.600'
            w='24px'
            h='24px'
          />
        </Flex>
        <Flex mb='20px'>
          <Checkbox me='16px' defaultChecked colorScheme='brandScheme' />
          <Text
            fontWeight='bold'
            color={textColor}
            fontSize='md'
            textAlign='start'>
            Dashboard Builder
          </Text>
          <Icon
            ms='auto'
            as={MdDragIndicator}
            color='secondaryGray.600'
            w='24px'
            h='24px'
          />
        </Flex>
        <Flex mb='20px'>
          <Checkbox defaultChecked me='16px' colorScheme='brandScheme' />
          <Text
            fontWeight='bold'
            color={textColor}
            fontSize='md'
            textAlign='start'>
            Mobile App Design
          </Text>
          <Icon
            ms='auto'
            as={MdDragIndicator}
            color='secondaryGray.600'
            w='24px'
            h='24px'
          />
        </Flex>
        <Flex mb='20px'>
          <Checkbox me='16px' colorScheme='brandScheme' />
          <Text
            fontWeight='bold'
            color={textColor}
            fontSize='md'
            textAlign='start'>
            Illustrations
          </Text>
          <Icon
            ms='auto'
            as={MdDragIndicator}
            color='secondaryGray.600'
            w='24px'
            h='24px'
          />
        </Flex>
        <Flex mb='20px'>
          <Checkbox defaultChecked me='16px' colorScheme='brandScheme' />
          <Text
            fontWeight='bold'
            color={textColor}
            fontSize='md'
            textAlign='start'>
            Promotional LP
          </Text>
          <Icon
            ms='auto'
            as={MdDragIndicator}
            color='secondaryGray.600'
            w='24px'
            h='24px'
          />
        </Flex>
      </Box>
    </Card>
  );
}
