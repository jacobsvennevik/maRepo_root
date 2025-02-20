import { Flex } from "@chakra-ui/react";
import React from "react";

/**
 * A horizontal separator component.
 * @param {Object} props - The props object passed to the component
 * @param {string} [props.variant] - The variant of the component
 * @param {*} [props.children] - The children of the component
 * @param {*} [props.rest] - The rest of the props
 * @return {ReactElement} The horizontal separator component
 */
const HSeparator = (props) => {
  const { variant, children, ...rest } = props;
  return (
    <Flex
      h="1px"
      w="100%"
      bg="rgba(135, 140, 189, 0.3)"
      {...rest}
    ></Flex>
  );
};

/**
 * A vertical separator component.
 * @param {Object} props - The props object passed to the component
 * @param {string} [props.variant] - The variant of the component
 * @param {*} [props.children] - The children of the component
 * @param {*} [props.rest] - The rest of the props
 * @return {ReactElement} The vertical separator component
 */
const VSeparator = (props) => {
  const { variant, children, ...rest } = props;
  return (
    <Flex
      w="1px"
      bg="rgba(135, 140, 189, 0.3)"
      {...rest}
    ></Flex>
  );
};

export { HSeparator, VSeparator };
