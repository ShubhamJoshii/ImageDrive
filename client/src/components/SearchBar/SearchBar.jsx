import React from "react";
import { IoSearchSharp } from "react-icons/io5";
import "./SearchBar.css"
const SearchBar = () => {
  return (
    <div id="searchBar">
      <IoSearchSharp />
      <input
        type="search"
        name="search"
        id="search"
        placeholder="Search in Storage"
      />
    </div>
  );
};

export default SearchBar;
