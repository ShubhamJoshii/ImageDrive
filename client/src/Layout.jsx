import React from "react";
import { Outlet } from "react-router-dom";

import SideNavbar from "./components/SideNavbar/SideNavbar";
import Header from "./components/Header/header";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuTrigger,
} from "rctx-contextmenu";
import { MdCreateNewFolder } from "react-icons/md";
import { LuFileUp } from "react-icons/lu";

const Layout = () => {
  return (
    <div id="container">
      <SideNavbar />
      <ContextMenuTrigger id="my-context-menu-1">
        <div id="content">
          <Header />
          <main>
            <Outlet />
          </main>
        </div>
      </ContextMenuTrigger>
    </div>
  );
};

export default Layout;
