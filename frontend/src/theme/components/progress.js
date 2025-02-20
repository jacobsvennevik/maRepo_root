import { mode } from "@chakra-ui/theme-tools";
export const progressStyles = {
  components: {
    Progress: {
      baseStyle: {
        field: {
          fontWeight: 400,
          w: "16px",
          h: "16px",
          borderRadius: "20px",
          _checked: { transform: "translate(20px, 0px)" },
        },
        track: {
          w: "40px",
          h: "20px",
          borderRadius: "20px",
          _focus: {
            boxShadow: "none",
          },
        },
      },

      variants: {
        /**
         * Function to define styles for the table component.
         * @param {object} props - The props object.
         * @returns {object} The style configuration for the table.
         */
        table: (props) => ({
          field: {
            // Background color for the field
            bg: "brand.500",
            // Border radius for the field
            borderRadius: "16px",
            // Font size for the field
            fontSize: "sm",
          },
          track: {
            // Border radius for the track
            borderRadius: "20px",
            // Background color for the track, changes with color mode
            bg: mode("blue.50", "whiteAlpha.50")(props),
            // Height of the track
            h: "8px",
            // Width of the track
            w: "54px",
          },
          thumb: {
            // Width of the thumb
            w: "250px",
          },
        }),
      },
    },
  },
};
