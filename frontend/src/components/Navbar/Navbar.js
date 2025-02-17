import React, { useState, useEffect } from "react";
import {
  Navbar,
  MobileNav,
  Typography,
  Button,
  IconButton,
} from "@material-tailwind/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function LandingNavbar() {
  const [openNav, setOpenNav] = useState(false);

  useEffect(() => {
    const handleResize = () => window.innerWidth >= 960 && setOpenNav(false);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navList = (
    <ul className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-6">
      <Typography as="li" variant="small" color="blue-gray" className="font-medium">
        <a href="#features" className="hover:text-blue-500 transition-colors">
          Features
        </a>
      </Typography>
      <Typography as="li" variant="small" color="blue-gray" className="font-medium">
        <a href="#about" className="hover:text-blue-500 transition-colors">
          About
        </a>
      </Typography>
      <Typography as="li" variant="small" color="blue-gray" className="font-medium">
        <a href="#contact" className="hover:text-blue-500 transition-colors">
          Contact
        </a>
      </Typography>
    </ul>
  );

  return (
    <Navbar className="mx-auto max-w-screen-xl px-4 py-2 lg:px-8 lg:py-4">
      <div className="flex items-center justify-between text-blue-gray-900">
        <Typography
          as="a"
          href="#"
          className="mr-4 cursor-pointer py-1.5 font-medium text-xl"
        >
          AI Study Assistant
        </Typography>
        <div className="hidden lg:block">{navList}</div>
        <div className="flex items-center gap-x-2">
          <Button variant="gradient" size="sm">
            Sign Up
          </Button>
          <Button variant="text" size="sm">
            Log In
          </Button>
        </div>
        <IconButton
          variant="text"
          className="ml-auto h-6 w-6 text-inherit lg:hidden"
          onClick={() => setOpenNav(!openNav)}
        >
          {openNav ? (
            <XMarkIcon className="h-6 w-6" strokeWidth={2} />
          ) : (
            <Bars3Icon className="h-6 w-6" strokeWidth={2} />
          )}
        </IconButton>
      </div>
      <MobileNav open={openNav}>
        <div className="flex flex-col items-center gap-2">{navList}</div>
      </MobileNav>
    </Navbar>
  );
}
