// Chakra imports
import {
  Flex,
  FormLabel,
  Input,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
// Custom components
import React from "react";

/**
 * Default is a functional component that displays a basic input field.
 * It includes a label, input field, and optional extra content.
 * @param {Object} props - The component props.
 * @param {string} props.id - The id of the input field.
 * @param {string} props.label - The label for the input field.
 * @param {string} props.extra - The extra content to display next to the label.
 * @param {string} props.placeholder - The placeholder text for the input field.
 * @param {string} props.type - The type of input field to display (e.g. text, password, etc.).
 * @param {string} props.mb - The margin bottom for the component.
 * @param {Object} props.rest - The rest of the props for the input field.
 * @returns {JSX.Element} The rendered component.
 */
export default function Default(props) {
  const { id, label, extra, placeholder, type, mb, ...rest } = props;
  // Chakra Color Mode
  const textColorPrimary = useColorModeValue("secondaryGray.900", "white");

  return (
    <Flex direction='column' mb={mb ? mb : "30px"}>
      {/* The label for the input field */}
      <FormLabel
        display='flex'
        ms='10px'
        htmlFor={id}
        fontSize='sm'
        color={textColorPrimary}
        fontWeight='bold'
        _hover={{ cursor: "pointer" }}>
        {label}
        {/* Optional extra content to display next to the label */}
        {extra && <Text fontSize='sm' fontWeight='400' ms='2px'>{extra}</Text>}
      </FormLabel>
      {/* The input field */}
      <Input
        {...rest}
        type={type}
        id={id}
        fontWeight='500'
        variant='main'
        placeholder={placeholder}
        _placeholder={{ fontWeight: "400", color: "secondaryGray.600" }}
        h='44px'
        maxh='44px'
      />
    </Flex>
  );
}
