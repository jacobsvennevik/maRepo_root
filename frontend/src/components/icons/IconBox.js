import React from "react";
import { Flex } from "@chakra-ui/react";

/**
 * A simple component that wraps an icon in a Flex container.
 *
 * This component is used to center the icons in the menu items.
 *
 * @example
 * import React from "react";
 * import { BiHome } from "react-icons/bi";
 * import { IconBox } from "../../components/icons/IconBox";
 *
 * const Example = () => {
 *   return (
 *     <IconBox
 *       icon={<BiHome />}
 *       bg="blue.500"
 *       color="white"
 *       boxSize="45px"
 *       _hover={{ bg: "blue.600" }}
 *     />
 *   );
 * };
 *
 * @param {Object} props - The props object.
 * @param {React.ReactElement} props.icon - The icon to be rendered.
 * @param {string} [props.bg] - The background color of the container.
 * @param {string} [props.color] - The color of the icon.
 * @param {string} [props.boxSize] - The size of the container.
 * @param {React.CSSProperties} [props._hover] - The styles to be applied when the user hovers over the container.
 * @returns {React.ReactElement} The IconBox component.
 */
export default function IconBox(props) {
  const { icon, ...rest } = props;

  return (
    <Flex
      alignItems={"center"}
      justifyContent={"center"}
      borderRadius={"50%"}
      {...rest}
    >
      {icon}
    </Flex>
  );
}
