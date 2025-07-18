'use client'
import React from "react";
import { FloatingDock } from "./floating-dock";
import {
  IconHome,
} from "@tabler/icons-react";
import { LayoutDashboard, ListTodo } from "lucide-react";

export function FloatingDockBar() {
    const links = [
      {
        title: "Dashboard",
        icon: (
          <LayoutDashboard className="h-full w-full text-neutral-500 dark:text-neutral-300" />
        ),
        href: "/dashboard",
      },
    {
      title: "Home",
      icon: (
        <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/",
    },
    {
      title: "Todos",
      icon: (
        <ListTodo className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/todos",
    },
  ];
  return (
    <div className="flex items-center justify-center w-full fixed bottom-5 left-0 z-50">
      <FloatingDock
        mobileClassName="translate-y-20" // only for demo, remove for production
        items={links}
      />
    </div>
  );
}
