// Chakra imports
import {
  Box,
  Flex,
  FormLabel,
  Switch,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
// Custom components
import React from "react";

/**
 * Default export of `SwitchField` component.
 *
 * @param {object} props component props
 * @param {string} props.id id of the switch
 * @param {string} props.label label of the switch
 * @param {boolean} props.isChecked checked state of the switch
 * @param {function} props.onChange function to handle onChange event
 * @param {string} props.desc description of the switch
 * @param {string} props.textWidth max width of the text
 * @param {boolean} props.reversed reversed layout of the switch
 * @param {string} props.fontSize font size of the text
 * @returns {ReactElement} component
 */
export default function Default(props) {
  const {
    id,
    label,
    isChecked,
    onChange,
    desc,
    textWidth,
    reversed,
    fontSize,
    ...rest
  } = props;
  const textColorPrimary = useColorModeValue("secondaryGray.900", "white");
  return (
    <Box w='100%' fontWeight='500' {...rest}>
      {reversed ? (
        <Flex align='center' borderRadius='16px'>
          {isChecked && onChange ? (
            <Switch
              // If the switch is checked and onChange is defined, render the switch
              // with the onChange function
              isChecked={isChecked}
              id={id}
              variant='main'
              colorScheme='brandScheme'
              size='md'
              onChange={onChange}
            />
          ) : (
            // Otherwise, render the switch without the onChange function
            <Switch
              id={id}
              variant='main'
              colorScheme='brandScheme'
              size='md'
            />
          )}
          <FormLabel
            // Margin start (ms) is set to 15px
            ms='15px'
            htmlFor={id}
            _hover={{ cursor: "pointer" }}
            direction='column'
            mb='0px'
            maxW={textWidth ? textWidth : "75%"}>
            <Text
              color={textColorPrimary}
              fontSize='md'
              fontWeight='500'>
              {label}
            </Text>
            <Text
              color='secondaryGray.600'
              fontSize={fontSize ? fontSize : "md"}>
              {desc}
            </Text>
          </FormLabel>
        </Flex>
      ) : (
        // If the switch is not reversed, render the switch with the label on the
        // left side and the switch on the right side
        <Flex justify='space-between' align='center' borderRadius='16px'>
          <FormLabel
            htmlFor={id}
            _hover={{ cursor: "pointer" }}
            direction='column'
            maxW={textWidth ? textWidth : "75%"}>
            <Text
              color={textColorPrimary}
              fontSize='md'
              fontWeight='500'>
              {label}
            </Text>
            <Text
              color='secondaryGray.600'
              fontSize={fontSize ? fontSize : "md"}>
              {desc}
            </Text>
          </FormLabel>
          {isChecked && onChange ? (
            <Switch
              // If the switch is checked and onChange is defined, render the switch
              // with the onChange function
              isChecked={isChecked}
              id={id}
              variant='main'
              colorScheme='brandScheme'
              size='md'
              onChange={onChange}
            />
          ) : (
            // Otherwise, render the switch without the onChange function
            <Switch
              id={id}
              variant='main'
              colorScheme='brandScheme'
              size='md'
            />
          )}
        </Flex>
      )}
    </Box>
  );
}
