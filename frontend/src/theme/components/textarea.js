import { mode } from "@chakra-ui/theme-tools";
export const textareaStyles = {
  components: {
    Textarea: {
      baseStyle: {
        field: {
          fontWeight: 400,
          borderRadius: "8px",
        },
      },

      variants: {
        /**
         * Main variant for the Textarea component.
         * This variant is used to set the basic style of the Textarea.
         * @param {Object} props - The props object provided by Chakra.
         * @returns {Object} The style object for main variant.
         */
        main: (props) => ({
          field: {
            /**
             * Set the background color of the Textarea.
             * @type {string}
             */
            bg: mode("transparent", "navy.800")(props),
            /**
             * Set the border style of the Textarea.
             * @type {string}
             */
            border: "1px solid !important",
            /**
             * Set the color of the Textarea text.
             * @type {string}
             */
            color: mode("secondaryGray.900", "white")(props),
            /**
             * Set the border color of the Textarea.
             * @type {string}
             */
            borderColor: mode("secondaryGray.100", "whiteAlpha.100")(props),
            /**
             * Set the border radius of the Textarea.
             * @type {string}
             */
            borderRadius: "16px",
            /**
             * Set the font size of the Textarea.
             * @type {string}
             */
            fontSize: "sm",
            /**
             * Set the padding of the Textarea.
             * @type {string}
             */
            p: "20px",
            /**
             * Set the placeholder color of the Textarea.
             * @type {Object}
             */
            _placeholder: { color: "secondaryGray.400" },
          },
        }),
        auth: (props) => ({
          field: {
            bg: "white",
            border: "1px solid",
            borderColor: "secondaryGray.100",
            borderRadius: "16px",
            _placeholder: { color: "secondaryGray.600" },
          },
        }),
        authSecondary: (props) => ({
          field: {
            bg: "white",
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
  },
};
