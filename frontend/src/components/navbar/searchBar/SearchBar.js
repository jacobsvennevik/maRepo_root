import React from "react";
import {
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
/**
 * The SearchBar component is a search bar with a search icon.
 * It supports a couple of props, like variant, background, children, placeholder, and borderRadius.
 * The component will be responsive and will change its width based on the view port size.
 * @param {Object} props - The component props.
 * @param {String} props.variant - The variant of the search bar.
 * @param {String} props.background - The background color of the search bar.
 * @param {React.ReactNode} props.children - The children of the search bar.
 * @param {String} props.placeholder - The placeholder text of the search bar.
 * @param {String} props.borderRadius - The border radius of the search bar.
 */
export function SearchBar(props) {
  // Pass the computed styles into the `__css` prop
  const { variant, background, children, placeholder, borderRadius, ...rest } =
    props;

  // Chakra Color Mode
  const searchIconColor = useColorModeValue("gray.700", "white");
  const inputBg = useColorModeValue("secondaryGray.300", "navy.900");
  const inputText = useColorModeValue("gray.700", "gray.100");

  return (
    <InputGroup
      w={{ base: "100%", md: "200px" }}
      {...rest}
      /* The width of the search bar will be 100% on small devices and 200px on medium devices */
    >
      <InputLeftElement
        children={
          <IconButton
            bg='inherit'
            borderRadius='inherit'
            _hover='none'
            _active={{
              bg: "inherit",
              transform: "none",
              borderColor: "transparent",
            }}
            _focus={{
              boxShadow: "none",
            }}
            icon={
              <SearchIcon color={searchIconColor} w='15px' h='15px' />
            }
          />
        }
      />
      <Input
        variant='search'
        fontSize='sm'
        bg={background ? background : inputBg}
        color={inputText}
        fontWeight='500'
        _placeholder={{
          color: "gray.400",
          fontSize: "14px",
        }}
        borderRadius={borderRadius ? borderRadius : "30px"}
        placeholder={placeholder ? placeholder : "Search..."}
      />
    </InputGroup>
  );
}
