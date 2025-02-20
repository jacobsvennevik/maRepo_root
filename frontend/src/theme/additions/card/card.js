import { mode } from "@chakra-ui/theme-tools";
const Card = {
  /**
   * The base style configuration for the Card component.
   * @param {object} props - The properties object.
   * @returns {object} The style configuration object.
   */
  baseStyle: (props) => ({
    p: "20px", // Padding for the card
    display: "flex", // Display as a flex container
    flexDirection: "column", // Arrange children in a column
    width: "100%", // Full width of the parent
    position: "relative", // Position relative to its normal position
    borderRadius: "20px", // Rounded corners
    minWidth: "0px", // Minimum width
    wordWrap: "break-word", // Break words when necessary to prevent overflow
    bg: mode("#ffffff", "navy.800")(props), // Background color based on the color mode
    backgroundClip: "border-box", // Background is clipped to the border box
  }),
};

export const CardComponent = {
  components: {
    Card,
  },
};
