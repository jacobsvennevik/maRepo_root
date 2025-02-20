// Chakra imports
import { Button, Flex, Input, useColorModeValue } from "@chakra-ui/react";
// Assets
import React from "react";
import { useDropzone } from "react-dropzone";

/**
 * Dropzone component
 * @param {Object} props - The props passed to the component.
 * @param {String} props.content - The content of the button.
 * @returns {JSX.Element} The rendered component.
 */
function Dropzone(props) {
  const { content, ...rest } = props;
  const { getRootProps, getInputProps } = useDropzone();
  const bg = useColorModeValue("gray.100", "navy.700");
  const borderColor = useColorModeValue("secondaryGray.100", "whiteAlpha.100");
  return (
    <Flex
      align='center'
      justify='center'
      bg={bg}
      border='1px dashed'
      borderColor={borderColor}
      borderRadius='16px'
      w='100%'
      h='max-content'
      minH='100%'
      cursor='pointer'
      // Pass the `getRootProps` to the outermost element
      {...getRootProps({ className: "dropzone" })}
      // Pass the other props to the component
      {...rest}>
      <Input variant='main' {...getInputProps()} />
      <Button variant='no-effects'>{content}</Button>
    </Flex>
  );
}

export default Dropzone;
