import React, { useEffect, useState } from "react";
import "./SideNavbar.css";
import { IoMdAdd, IoMdArrowDropright } from "react-icons/io";
import { SiGooglecloudstorage } from "react-icons/si";
import { NavLink, useLocation } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import { ImClock } from "react-icons/im";
import { FaFolderOpen } from "react-icons/fa";
import RightClickMenu from "../RightClickMenu/rightClickMenu";
import { MdOutlineMenu } from "react-icons/md";
const NavbarData = [
  {
    text: "Home",
    logo: <FaHome />,
    link: "/",
    dropDown: [],
  },
  // {
  //   text: "My Storage",
  //   logo: <SiGooglecloudstorage />,
  //   link: "/myStorage",
  //   dropDown: [10, 20, 30, 60],
  // },
  {
    text: "Recent",
    logo: <ImClock />,
    link: "/recent",
    dropDown: [],
  },
];
const SideNavbar = () => {
  const [dropDownShow, setDropDownShow] = useState([]);
  const [showRightClickMenu, setRightClickMenu] = useState(false);
  const [showMenu, setShowMenu] = useState(()=>{
    return window.innerWidth >= 1340 
  });
  const location = useLocation();

  return (
    <>
      <div id="menuBtn" onClick={() => setShowMenu(!showMenu)}>
        <MdOutlineMenu />
      </div>
      <div id="SideNavbar" style={showMenu ? {} : {display:"none"}}>
        <h2>Image Storage</h2>
        <div id="add-button">
          <button
            onClick={() => {
              setRightClickMenu((prev) => !prev);
            }}
          >
            <IoMdAdd />
            <p>New</p>
          </button>
          
          <RightClickMenu
            showRightClickMenu={showRightClickMenu}
            setRightClickMenu={setRightClickMenu}
          />
        </div>
        {NavbarData.map((curr, id) => {
          const updateDropDown = () => {
            if (dropDownShow.find((e) => e === curr.text)) {
              let temp = dropDownShow.filter((e) => e !== curr.text);
              setDropDownShow(temp);
            } else {
              setDropDownShow([...dropDownShow, curr.text]);
            }
          };
          return (
            <>
              <div
                className={
                  location.pathname === curr.link
                    ? "navbarLink activeLink"
                    : "navbarLink"
                }
                key={id}
              >
                {curr.dropDown.length > 0 && (
                  <IoMdArrowDropright id="dropDown" onClick={updateDropDown} />
                )}
                <NavLink to={curr.link}>
                  {curr.logo}
                  <p>{curr.text}</p>
                </NavLink>
              </div>

              {/* {dropDownShow.find((e) => e === curr.text) && (
              <>
                {curr.dropDown.map((curr2) => {
                  return (
                    <div className="navbarLink navbarLink2">
                      {curr.dropDown.length > 0 && (
                        <FaFolderOpen id="dropDown" onClick={updateDropDown} />
                      )}
                      <NavLink to={curr.link}>
                        <p>{curr2}</p>
                      </NavLink>
                    </div>
                  );
                })}
              </>
            )} */}
            </>
          );
        })}
      </div>
    </>
  );
};

export default SideNavbar;
