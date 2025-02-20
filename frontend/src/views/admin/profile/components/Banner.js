// Chakra imports
import { Avatar, Box, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import Card from "components/card/Card.js";
import React from "react";

/**
 * Banner component displays a user's profile information including
 * banner image, avatar, name, job title, and social statistics.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.banner - URL of the banner image.
 * @param {string} props.avatar - URL of the avatar image.
 * @param {string} props.name - User's name.
 * @param {string} props.job - User's job title.
 * @param {number} props.posts - Number of posts.
 * @param {number} props.followers - Number of followers.
 * @param {number} props.following - Number of following.
 * @returns {JSX.Element} The rendered Banner component.
 */
export default function Banner(props) {
  const { banner, avatar, name, job, posts, followers, following } = props;

  // Chakra Color Mode
  const textColorPrimary = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = "gray.400";
  const borderColor = useColorModeValue(
    "white !important",
    "#111C44 !important"
  );

  return (
    <Card mb={{ base: "0px", lg: "20px" }} align='center'>
      {/* Banner image */}
      <Box
        bg={`url(${banner})`}
        bgSize='cover'
        borderRadius='16px'
        h='131px'
        w='100%'
      />
      {/* Avatar image */}
      <Avatar
        mx='auto'
        src={avatar}
        h='87px'
        w='87px'
        mt='-43px'
        border='4px solid'
        borderColor={borderColor}
      />
      {/* User's name */}
      <Text color={textColorPrimary} fontWeight='bold' fontSize='xl' mt='10px'>
        {name}
      </Text>
      {/* User's job title */}
      <Text color={textColorSecondary} fontSize='sm'>
        {job}
      </Text>
      {/* User's social statistics */}
      <Flex w='max-content' mx='auto' mt='26px'>
        <Flex mx='auto' me='60px' align='center' direction='column'>
          <Text color={textColorPrimary} fontSize='2xl' fontWeight='700'>
            {posts}
          </Text>
          <Text color={textColorSecondary} fontSize='sm' fontWeight='400'>
            Posts
          </Text>
        </Flex>
        <Flex mx='auto' me='60px' align='center' direction='column'>
          <Text color={textColorPrimary} fontSize='2xl' fontWeight='700'>
            {followers}
          </Text>
          <Text color={textColorSecondary} fontSize='sm' fontWeight='400'>
            Followers
          </Text>
        </Flex>
        <Flex mx='auto' align='center' direction='column'>
          <Text color={textColorPrimary} fontSize='2xl' fontWeight='700'>
            {following}
          </Text>
          <Text color={textColorSecondary} fontSize='sm' fontWeight='400'>
            Following
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
}
