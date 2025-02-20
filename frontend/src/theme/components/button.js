import { mode } from "@chakra-ui/theme-tools";
export const buttonStyles = {
  components: {
    Button: {
      baseStyle: {
        borderRadius: "16px",
        boxShadow: "45px 76px 113px 7px rgba(112, 144, 176, 0.08)",
        transition: ".25s all ease",
        boxSizing: "border-box",
        _focus: {
          boxShadow: "none",
        },
        _active: {
          boxShadow: "none",
        },
      },
      variants: {
        /**
         * Variant for outline style.
         * This variant is used for buttons with an outline.
         * @returns {Object} The style object for outline variant.
         * @example
         * <Button variant="outline">Click me</Button>
         */
        outline: () => ({
          /**
           * Set border radius to 16px.
           */
          borderRadius: "16px",
        })
        ,
        /**
         * Variant for brand style.
         * This variant is used for buttons styled with the brand color scheme.
         * @param {Object} props - The props object provided by Chakra.
         * @returns {Object} The style object for brand variant.
         * @example
         * <Button variant="brand">Click me</Button>
         */
        brand: (props) => ({
          /**
           * Set the background color of the button.
           * @type {string}
           */
          bg: mode("brand.500", "brand.400")(props),
          /**
           * Set the color of the button text.
           * @type {string}
           */
          color: "white",
          /**
           * Set the background color of the button on focus.
           * @type {Object}
           */
          _focus: {
            bg: mode("brand.500", "brand.400")(props),
          },
          /**
           * Set the background color of the button on active.
           * @type {Object}
           */
          _active: {
            bg: mode("brand.500", "brand.400")(props),
          },
          /**
           * Set the background color of the button on hover.
           * @type {Object}
           */
          _hover: {
            bg: mode("brand.600", "brand.400")(props),
          },
        }),
        /**
         * Variant for dark brand style.
         * This variant is used for buttons styled with the dark brand color scheme.
         * @param {Object} props - The props object provided by Chakra.
         * @returns {Object} The style object for dark brand variant.
         * @example
         * <Button variant="darkBrand">Click me</Button>
         */
        darkBrand: (props) => ({
          /**
           * Set the background color of the button.
           * @type {string}
           */
          bg: mode("brand.900", "brand.400")(props),
          /**
           * Set the color of the button text.
           * @type {string}
           */
          color: "white",
          /**
           * Set the background color of the button on focus.
           * @type {Object}
           */
          _focus: {
            bg: mode("brand.900", "brand.400")(props),
          },
          /**
           * Set the background color of the button on active.
           * @type {Object}
           */
          _active: {
            bg: mode("brand.900", "brand.400")(props),
          },
          /**
           * Set the background color of the button on hover.
           * @type {Object}
           */
          _hover: {
            bg: mode("brand.800", "brand.400")(props),
          },
        }),
        /**
         * Variant for light brand style.
         * This variant is used for buttons styled with the light brand color scheme.
         * @param {Object} props - The props object provided by Chakra.
         * @returns {Object} The style object for light brand variant.
         * @example
         * <Button variant="lightBrand">Click me</Button>
         */
        lightBrand: (props) => ({
          /**
           * Set the background color of the button.
           * @type {string}
           */
          bg: mode("#F2EFFF", "whiteAlpha.100")(props),
          /**
           * Set the color of the button text.
           * @type {string}
           */
          color: mode("brand.500", "white")(props),
          /**
           * Set the background color of the button on focus.
           * @type {Object}
           */
          _focus: {
            bg: mode("#F2EFFF", "whiteAlpha.100")(props),
          },
          /**
           * Set the background color of the button on active.
           * @type {Object}
           */
          _active: {
            bg: mode("secondaryGray.300", "whiteAlpha.100")(props),
          },
          /**
           * Set the background color of the button on hover.
           * @type {Object}
           */
          _hover: {
            bg: mode("secondaryGray.400", "whiteAlpha.200")(props),
          },
        }),
        /**
         * Variant for light style.
         * This variant is used for buttons styled with the light color scheme.
         * @param {Object} props - The props object provided by Chakra.
         * @returns {Object} The style object for light variant.
         * @example
         * <Button variant="light">Click me</Button>
         */
        light: (props) => ({
          /**
           * Set the background color of the button.
           * @type {string}
           */
          bg: mode("secondaryGray.300", "whiteAlpha.100")(props),
          /**
           * Set the color of the button text.
           * @type {string}
           */
          color: mode("secondaryGray.900", "white")(props),
          /**
           * Set the background color of the button on focus.
           * @type {Object}
           */
          _focus: {
            bg: mode("secondaryGray.300", "whiteAlpha.100")(props),
          },
          /**
           * Set the background color of the button on active.
           * @type {Object}
           */
          _active: {
            bg: mode("secondaryGray.300", "whiteAlpha.100")(props),
          },
          /**
           * Set the background color of the button on hover.
           * @type {Object}
           */
          _hover: {
            bg: mode("secondaryGray.400", "whiteAlpha.200")(props),
          },
        }),
        /**
         * Variant for action style.
         * This variant is used for buttons styled with the action color scheme.
         * @param {Object} props - The props object provided by Chakra.
         * @returns {Object} The style object for action variant.
         * @example
         * <Button variant="action">Click me</Button>
         */
        action: (props) => ({
          /**
           * Set the font weight of the button.
           * @type {string}
           */
          fontWeight: "500",
          /**
           * Set the border radius of the button.
           * @type {string}
           */
          borderRadius: "50px",
          /**
           * Set the background color of the button.
           * @type {string}
           */
          bg: mode("secondaryGray.300", "brand.400")(props),
          /**
           * Set the color of the button text.
           * @type {string}
           */
          color: mode("brand.500", "white")(props),
          /**
           * Set the background color of the button on focus.
           * @type {Object}
           */
          _focus: {
            bg: mode("secondaryGray.300", "brand.400")(props),
          },
          /**
           * Set the background color of the button on active.
           * @type {Object}
           */
          _active: { bg: mode("secondaryGray.300", "brand.400")(props) },
          /**
           * Set the background color of the button on hover.
           * @type {Object}
           */
          _hover: {
            bg: mode("secondaryGray.200", "brand.400")(props),
          },
        }),
        /**
         * Setup variant for button.
         * This variant is used to set the basic style of the button.
         * @param {Object} props - The props object provided by Chakra.
         * @returns {Object} The style object for setup variant.
         */
        setup: (props) => ({
          /**
           * Set the font weight of the button.
           * @type {string}
           */
          fontWeight: "500",
          /**
           * Set the border radius of the button.
           * @type {string}
           */
          borderRadius: "50px",
          /**
           * Set the background color of the button.
           * @type {string}
           */
          bg: mode("transparent", "brand.400")(props),
          /**
           * Set the border style of the button.
           * @type {string}
           */
          border: mode("1px solid", "0px solid")(props),
          /**
           * Set the border color of the button.
           * @type {string}
           */
          borderColor: mode("secondaryGray.400", "transparent")(props),
          /**
           * Set the color of the button text.
           * @type {string}
           */
          color: mode("secondaryGray.900", "white")(props),
          /**
           * Set the background color of the button on focus.
           * @type {Object}
           */
          _focus: {
            bg: mode("transparent", "brand.400")(props),
          },
          /**
           * Set the background color of the button on active.
           * @type {Object}
           */
          _active: { bg: mode("transparent", "brand.400")(props) },
          /**
           * Set the background color of the button on hover.
           * @type {Object}
           */
          _hover: {
            bg: mode("secondaryGray.100", "brand.400")(props),
          },
        }),
      },
    },
  },
};
