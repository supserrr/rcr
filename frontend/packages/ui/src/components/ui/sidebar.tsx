"use client";

import { cn } from "../../lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div> & { hideMobileTrigger?: boolean }) => {
  const { hideMobileTrigger, ...restProps } = props;
  return (
    <>
      <DesktopSidebar {...restProps} />
      <MobileSidebar {...(restProps as React.ComponentProps<"div">)} hideTrigger={hideMobileTrigger} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "h-full px-4 py-4 hidden md:flex md:flex-col bg-sidebar w-[300px] flex-shrink-0 rounded-br-3xl border-r border-sidebar-border font-sans",
        className
      )}
      animate={{
        width: animate ? (open ? "300px" : "80px") : "300px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  hideTrigger = false,
  ...props
}: React.ComponentProps<"div"> & { hideTrigger?: boolean }) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      {!hideTrigger && (
      <div
        className={cn(
          "h-10 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-sidebar w-full font-sans"
        )}
        {...props}
      >
        <div className="flex justify-end z-20 w-full">
          <Menu
            className="text-sidebar-foreground cursor-pointer"
            onClick={() => setOpen(!open)}
          />
        </div>
        </div>
      )}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className={cn(
              "fixed h-full w-full inset-0 bg-sidebar p-10 z-[100] flex flex-col justify-between font-sans md:hidden",
              className
            )}
          >
            <div
              className="absolute right-10 top-10 z-50 text-sidebar-foreground cursor-pointer"
              onClick={() => setOpen(!open)}
            >
              <X />
            </div>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  as: LinkComponent,
  ...props
}: {
  link: Links;
  className?: string;
  as?: React.ComponentType<React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>;
  props?: React.AnchorHTMLAttributes<HTMLAnchorElement>;
}) => {
  const { open, animate } = useSidebar();
  const content = (
    <>
      {link.icon}
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-sidebar-foreground text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0 font-sans"
      >
        {link.label}
      </motion.span>
    </>
  );

  const linkClassName = cn(
    "flex items-center justify-start gap-2 group/sidebar py-2",
    className
  );

  if (LinkComponent) {
    return (
      <LinkComponent
        href={link.href}
        className={linkClassName}
        {...props}
      >
        {content}
      </LinkComponent>
    );
  }

  return (
    <a
      href={link.href}
      className={linkClassName}
      {...props}
    >
      {content}
    </a>
  );
};

