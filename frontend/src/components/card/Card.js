import { Box, useStyleConfig } from "@chakra-ui/react";
/**
 * The Card component is a box component that is used to display content in a
 * box with a shadow.
 *
 * @param {Object} props - The props object.
 * @param {String} props.variant - The variant of the card to be rendered. Can be
 * one of "simple", "advanced", "stats", "pricing", "testimonial", "profile",
 * "cover", "nav", "plain", "default", or "outline".
 * @param {ReactNode} props.children - The children elements to be rendered.
 *
 * @returns {ReactElement} The Card component.
 */
function Card(props) {
  const { variant, children, ...rest } = props;
  const styles = useStyleConfig("Card", { variant });

  return (
    <Box __css={styles} {...rest}>
      {/* The children elements are rendered here */}
      {children}
    </Box>
  );
}

export default Card;
