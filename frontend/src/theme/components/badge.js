import { mode } from "@chakra-ui/theme-tools";
export const badgeStyles = {
  components: {
    Badge: {
      baseStyle: {
        borderRadius: "10px",
        lineHeight: "100%",
        padding: "7px",
        paddingLeft: "12px",
        paddingRight: "12px",
      },
      variants: {
        /**
         * Variant for outline style.
         * @returns {Object} The style object for outline variant.
         */
        outline: () => ({
          borderRadius: "16px", // Set border radius to 16px
        }),
        /**
         * Variant for brand style.
         * @param {Object} props - The props object provided by Chakra.
         * @returns {Object} The style object for brand variant.
         */
        brand: (props) => ({
          /**
           * Set the background color of the badge.
           * @type {string}
           */
          bg: mode("brand.500", "brand.400")(props),
          /**
           * Set the color of the badge.
           * @type {string}
           */
          color: "white",
          /**
           * Set the background color of the badge on focus.
           * @type {Object}
           */
          _focus: {
            bg: mode("brand.500", "brand.400")(props),
          },
          /**
           * Set the background color of the badge on active.
           * @type {Object}
           */
          _active: {
            bg: mode("brand.500", "brand.400")(props),
          },
          /**
           * Set the background color of the badge on hover.
           * @type {Object}
           */
          _hover: {
            bg: mode("brand.600", "brand.400")(props),
          },
        }),
      },
    },
  },
};
