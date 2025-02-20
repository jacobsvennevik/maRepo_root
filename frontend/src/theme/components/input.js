import { mode } from "@chakra-ui/theme-tools";
export const inputStyles = {
  components: {
    Input: {
      baseStyle: {
        field: {
          fontWeight: 400,
          borderRadius: "8px",
        },
      },

      variants: {
        /**
         * Main variant for the input component.
         * This variant is used to set the basic style of the input.
         * @param {Object} props - The props object provided by Chakra.
         * @returns {Object} The style object for main variant.
         */
        main: (props) => ({
          field: {
            /**
             * Set the background color of the input.
             * @type {string}
             */
            bg: mode("transparent", "navy.800")(props),
            /**
             * Set the border style of the input.
             * @type {string}
             */
            border: "1px solid",
            /**
             * Set the color of the input text.
             * @type {string}
             */
            color: mode("secondaryGray.900", "white")(props),
            /**
             * Set the border color of the input.
             * @type {string}
             */
            borderColor: mode("secondaryGray.100", "whiteAlpha.100")(props),
            /**
             * Set the border radius of the input.
             * @type {string}
             */
            borderRadius: "16px",
            /**
             * Set the font size of the input.
             * @type {string}
             */
            fontSize: "sm",
            /**
             * Set the padding of the input.
             * @type {string}
             */
            p: "20px",
            /**
             * Set the placeholder color of the input.
             * @type {Object}
             */
            _placeholder: { color: "secondaryGray.400" },
          },
        }),
        /**
         * Auth variant for the input component.
         * This variant is used to set the style of the input for authentication.
         * @param {Object} props - The props object provided by Chakra.
         * @returns {Object} The style object for auth variant.
         */
        auth: (props) => ({
          field: {
            /**
             * Set the font weight of the input.
             * @type {string}
             */
            fontWeight: "500",
            /**
             * Set the color of the input text.
             * @type {string}
             */
            color: mode("navy.700", "white")(props),
            /**
             * Set the background color of the input.
             * @type {string}
             */
            bg: mode("transparent", "transparent")(props),
            /**
             * Set the border style of the input.
             * @type {string}
             */
            border: "1px solid",
            /**
             * Set the border color of the input.
             * @type {string}
             */
            borderColor: mode("secondaryGray.100", "rgba(135, 140, 189, 0.3)")(props),
            /**
             * Set the border radius of the input.
             * @type {string}
             */
            borderRadius: "16px",
            /**
             * Set the placeholder style of the input.
             * @type {Object}
             */
            _placeholder: { color: "secondaryGray.600", fontWeight: "400" },
          },
        }),
        /**
         * authSecondary variant for the input component.
         * This variant is used to set the style of the input for secondary authentication.
         * @param {Object} props - The props object provided by Chakra.
         * @returns {Object} The style object for authSecondary variant.
         */
        authSecondary: (props) => ({
          field: {
            /**
             * Set the background color of the input.
             * @type {string}
             */
            bg: "transparent",
            /**
             * Set the border style of the input.
             * @type {string}
             */
            border: "1px solid",
            /**
             * Set the border color of the input.
             * @type {string}
             */
            borderColor: "secondaryGray.100",
            /**
             * Set the border radius of the input.
             * @type {string}
             */
            borderRadius: "16px",
            /**
             * Set the placeholder style of the input.
             * @type {Object}
             */
            _placeholder: { color: "secondaryGray.600" },
          },
        }),
        /**
         * search variant for the input component.
         * This variant is used to set the style of the input for search fields.
         * @param {Object} props - The props object provided by Chakra.
         * @returns {Object} The style object for search variant.
         */
        search: (props) => ({
          field: {
            /**
             * Set the border of the input to none.
             * @type {string}
             */
            border: "none",
            /**
             * Set the padding y of the input to 11px.
             * @type {string}
             */
            py: "11px",
            /**
             * Set the border radius of the input to inherit.
             * @type {string}
             */
            borderRadius: "inherit",
            /**
             * Set the style of the input placeholder.
             * @type {Object}
             */
            _placeholder: { color: "secondaryGray.600" },
          },
        }),
      },
    },
    NumberInput: {
      baseStyle: {
        field: {
          fontWeight: 400,
        },
      },

      variants: {
        /**
         * The main variant of the NumberInput component.
         * This variant is used to set the style of the input for main use cases.
         * @param {Object} props - The props object provided by Chakra.
         * @returns {Object} The style object for main variant.
         */
        main: (props) => ({
          field: {
            /**
             * Set the background color of the input to transparent.
             * @type {string}
             */
            bg: "transparent",
            /**
             * Set the border of the input to 1px solid.
             * @type {string}
             */
            border: "1px solid",

            /**
             * Set the border color of the input to secondaryGray.100.
             * @type {string}
             */
            borderColor: "secondaryGray.100",
            /**
             * Set the border radius of the input to 16px.
             * @type {string}
             */
            borderRadius: "16px",
            /**
             * Set the style of the input placeholder.
             * @type {Object}
             */
            _placeholder: { color: "secondaryGray.600" },
          },
        }),
        /**
         * The auth variant of the NumberInput component.
         * This variant is used to set the style of the input for authentication use cases.
         * @param {Object} props - The props object provided by Chakra.
         * @returns {Object} The style object for auth variant.
         */
        auth: (props) => ({
          field: {
            /**
             * Set the background color of the input to transparent.
             * @type {string}
             */
            bg: "transparent",
            /**
             * Set the border of the input to 1px solid.
             * @type {string}
             */
            border: "1px solid",

            /**
             * Set the border color of the input to secondaryGray.100.
             * @type {string}
             */
            borderColor: "secondaryGray.100",
            /**
             * Set the border radius of the input to 16px.
             * @type {string}
             */
            borderRadius: "16px",
            /**
             * Set the style of the input placeholder.
             * @type {Object}
             */
            _placeholder: { color: "secondaryGray.600" },
          },
        }),
        /**
         * The authSecondary variant of the Input component.
         * This variant is used to set the style of the input for authentication use cases where the input is secondary.
         * @param {Object} props - The props object provided by Chakra.
         * @returns {Object} The style object for authSecondary variant.
         */
        authSecondary: (props) => ({
          /**
           * Set the style of the input.
           * @type {Object}
           */
          field: {
            /**
             * Set the background color of the input to transparent.
             * @type {string}
             */
            bg: "transparent",
            /**
             * Set the border of the input to 1px solid.
             * @type {string}
             */
            border: "1px solid",

            /**
             * Set the border color of the input to secondaryGray.100.
             * @type {string}
             */
            borderColor: "secondaryGray.100",
            /**
             * Set the border radius of the input to 16px.
             * @type {string}
             */
            borderRadius: "16px",
            /**
             * Set the style of the input placeholder.
             * @type {Object}
             */
            _placeholder: { color: "secondaryGray.600" },
          },
        }),
        /**
         * The search variant of the Input component.
         * This variant is used to set the style of the input for search use cases.
         * @param {Object} props - The props object provided by Chakra.
         * @returns {Object} The style object for search variant.
         */
        search: (props) => ({
          /**
           * Set the style of the input.
           * @type {Object}
           */
          field: {
            /**
             * Set the border of the input to none.
             * @type {string}
             */
            border: "none",
            /**
             * Set the padding top and bottom of the input to 11px.
             * @type {string}
             */
            py: "11px",
            /**
             * Set the border radius of the input to inherit.
             * @type {string}
             */
            borderRadius: "inherit",
            /**
             * Set the style of the input placeholder.
             * @type {Object}
             */
            _placeholder: { color: "secondaryGray.600" },
          },
        }),
      },
    },
    Select: {
      baseStyle: {
        field: {
          fontWeight: 400,
        },
      },

      variants: {
        /**
         * The main variant of the Select component.
         * This variant is used to set the style of the select for main use cases.
         * @param {Object} props - The props object provided by Chakra.
         * @returns {Object} The style object for main variant.
         */
        main: (props) => ({
          /**
           * Set the style of the select.
           * @type {Object}
           */
          field: {
            /**
             * Set the background color of the select to transparent.
             * @type {string}
             */
            bg: mode("transparent", "navy.800")(props),
            /**
             * Set the border of the select to 1px solid.
             * @type {string}
             */
            border: "1px solid",
            /**
             * Set the color of the select to secondaryGray.600.
             * @type {string}
             */
            color: "secondaryGray.600",
            /**
             * Set the border color of the select to secondaryGray.100.
             * @type {string}
             */
            borderColor: mode("secondaryGray.100", "whiteAlpha.100")(props),
            /**
             * Set the border radius of the select to 16px.
             * @type {string}
             */
            borderRadius: "16px",
            /**
             * Set the style of the select placeholder.
             * @type {Object}
             */
            _placeholder: { color: "secondaryGray.600" },
          },
          /**
           * Set the style of the select icon.
           * @type {Object}
           */
          icon: {
            /**
             * Set the color of the select icon to secondaryGray.600.
             * @type {string}
             */
            color: "secondaryGray.600",
          },
        }),
        mini: (props) => ({
          field: {
            bg: mode("transparent", "navy.800")(props),
            border: "0px solid transparent",
            fontSize: "0px",
            p: "10px",
            _placeholder: { color: "secondaryGray.600" },
          },
          icon: {
            color: "secondaryGray.600",
          },
        }),
        /**
         * Set the style of the select to subtle.
         * @type {Object}
         */
        subtle: (props) => ({
          /**
           * Set the style of the select box.
           * @type {Object}
           */
          box: {
            /**
             * Set the width of the select box to unset.
             * @type {string}
             */
            width: "unset",
          },
          /**
           * Set the style of the select field.
           * @type {Object}
           */
          field: {
            /**
             * Set the background color of the select field to transparent.
             * @type {string}
             */
            bg: "transparent",
            /**
             * Set the border of the select field to 0px solid transparent.
             * @type {string}
             */
            border: "0px solid transparent",
            /**
             * Set the color of the select field to secondaryGray.600.
             * @type {string}
             */
            color: "secondaryGray.600",
            /**
             * Set the border color of the select field to transparent.
             * @type {string}
             */
            borderColor: "transparent",
            /**
             * Set the width of the select field to max-content.
             * @type {string}
             */
            width: "max-content",
            /**
             * Set the style of the select placeholder.
             * @type {Object}
             */
            _placeholder: {
              /**
               * Set the color of the select placeholder to secondaryGray.600.
               * @type {string}
               */
              color: "secondaryGray.600",
            },
          },
          /**
           * Set the style of the select icon.
           * @type {Object}
           */
          icon: {
            /**
             * Set the color of the select icon to secondaryGray.600.
             * @type {string}
             */
            color: "secondaryGray.600",
          },
        }),
        /**
         * Transparent variant for the select component.
         * This variant is used to set a minimalistic style with transparency.
         * @param {Object} props - The props object provided by Chakra.
         * @returns {Object} The style object for transparent variant.
         */
        transparent: (props) => ({
          field: {
            /**
             * Set the background color of the select field to transparent.
             * @type {string}
             */
            bg: "transparent",
            /**
             * Set the border of the select field to 0px solid transparent.
             * @type {string}
             */
            border: "0px solid",
            /**
             * Set the width of the select field to min-content.
             * @type {string}
             */
            width: "min-content",
            /**
             * Set the color of the select field using color mode.
             * @type {string}
             */
            color: mode("secondaryGray.600", "secondaryGray.600")(props),
            /**
             * Set the border color of the select field to transparent.
             * @type {string}
             */
            borderColor: "transparent",
            /**
             * Set the padding of the select field.
             * @type {string}
             */
            padding: "0px",
            paddingLeft: "8px",
            paddingRight: "20px",
            /**
             * Set the font weight of the select field.
             * @type {string}
             */
            fontWeight: "700",
            /**
             * Set the font size of the select field.
             * @type {string}
             */
            fontSize: "14px",
            /**
             * Set the style of the select placeholder.
             * @type {Object}
             */
            _placeholder: { color: "secondaryGray.600" },
          },
          icon: {
            /**
             * Set the transform style of the select icon.
             * @type {string}
             */
            transform: "none !important",
            /**
             * Set the position style of the select icon.
             * @type {string}
             */
            position: "unset !important",
            /**
             * Set the width of the select icon to unset.
             * @type {string}
             */
            width: "unset",
            /**
             * Set the color of the select icon.
             * @type {string}
             */
            color: "secondaryGray.600",
            /**
             * Set the right alignment of the select icon.
             * @type {string}
             */
            right: "0px",
          },
        }),
        /**
         * Set the style of the select field for the auth variant.
         * @param {Object} props - The props object provided by Chakra.
         * @returns {Object} The style object for the auth variant.
         */
        auth: (props) => ({
          /**
           * Set the style of the select field.
           * @type {Object}
           */
          field: {
            /**
             * Set the background color of the select field to transparent.
             * @type {string}
             */
            bg: "transparent",
            /**
             * Set the border of the select field to 1px solid.
             * @type {string}
             */
            border: "1px solid",

            /**
             * Set the border color of the select field to secondaryGray.100.
             * @type {string}
             */
            borderColor: "secondaryGray.100",
            /**
             * Set the border radius of the select field to 16px.
             * @type {string}
             */
            borderRadius: "16px",
            /**
             * Set the style of the select placeholder.
             * @type {Object}
             */
            _placeholder: { color: "secondaryGray.600" },
          },
        }),
        authSecondary: (props) => ({
          field: {
            bg: "transparent",
            border: "1px solid",

            borderColor: "secondaryGray.100",
            borderRadius: "16px",
            _placeholder: { color: "secondaryGray.600" },
          },
        }),
        search: (props) => ({
          field: {
            border: "none",
            py: "11px",
            borderRadius: "inherit",
            _placeholder: { color: "secondaryGray.600" },
          },
        }),
      },
    },
    // PinInputField: {
    //   variants: {
    //     main: (props) => ({
    //       field: {
    //         bg: "red !important",
    //         border: "1px solid",
    //         color: mode("secondaryGray.900", "white")(props),
    //         borderColor: mode("secondaryGray.100", "whiteAlpha.100")(props),
    //         borderRadius: "16px",
    //         _placeholder: { color: "secondaryGray.600" },
    //       },
    //     }),
    //   },
    // },
  },
};
