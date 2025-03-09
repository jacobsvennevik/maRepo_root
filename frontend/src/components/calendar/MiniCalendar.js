import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "assets/css/MiniCalendar.css";
import { Text, Icon } from "@chakra-ui/react";
// Chakra imports
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
// Custom components
import Card from "components/card/Card.js";

/**
 * MiniCalendar is a component that displays a calendar and allows users to select a range of dates.
 * It wraps the react-calendar component and provides a default layout and styling.
 * @param {{selectRange: boolean}} props - Component props.
 * @param {boolean} props.selectRange - Whether to select a range of dates or not.
 * @returns A JSX element for the MiniCalendar component.
 */
function MiniCalendar(props) {
  const { selectRange, ...rest } = props;
  const [value, onChange] = useState(new Date());

  return (
    <Card
      align='center'
      direction='column'
      w='100%'
      maxW='max-content'
      p='20px 15px'
      h='max-content'
      {...rest}>
      <Calendar
        // The onChange event is called whenever the user clicks on a date or selects a range of dates.
        onChange={onChange}
        // The value prop is used to set the selected date(s) in the calendar.
        value={value}
        // The selectRange prop is used to select a range of dates instead of a single date.
        selectRange={selectRange}
        // The view prop is used to set the view of the calendar.
        view={"month"}
        // The tileContent prop is used to render a custom component for each day in the calendar.
        tileContent={<Text color='brand.500'></Text>}
        // The prevLabel prop is used to render a custom component for the previous month button.
        prevLabel={<Icon as={MdChevronLeft} w='24px' h='24px' mt='4px' />}
        // The nextLabel prop is used to render a custom component for the next month button.
        nextLabel={<Icon as={MdChevronRight} w='24px' h='24px' mt='4px' />}
      />
    </Card>
  );
}

// Export as a named export
export { MiniCalendar };
export default MiniCalendar;