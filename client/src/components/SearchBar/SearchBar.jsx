import React, { useEffect, useRef, useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import axios from "axios";
import { NavLink } from "react-router-dom";
import "./SearchBar.css";
import ShowFullScreenImage from "../ShowFullScreenImage/showFullScreenImage";
const SearchBar = () => {
  const [search, setSearch] = useState("");
  const [searchOutputMain, setSearchOutputMain] = useState([]);
  const [searchOutput, setSearchOutput] = useState([]);
  const [showImage, setShowImage] = useState("");
  const ref = useRef();
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setSearchOutput([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

  const handleSearch = async (e) => {
    setSearch(e.target.value);
  };

  const findSearch = async () => {
    await axios.get(`/api/searchImage?search=${search}`).then((response) => {
      // console.log(response.data)
      setSearchOutput(response.data.searchOutput);
    });
  };

  useEffect(() => {
    const getData = setTimeout(() => {
      // if (search.length > 0) {
      findSearch();
      // }
    }, 1000);
    return () => clearTimeout(getData);
  }, [search]);

  return (
    <div id="searchBar">
      <IoSearchSharp />
      <input
        type="search"
        name="search"
        id="search"
        onChange={handleSearch}
        onClick={() => setSearchOutput(searchOutputMain)}
        value={search}
        placeholder="Search in Storage"
      />
      {searchOutput.length > 0 && (
        <div id="searchOutput" ref={ref}>
          {searchOutput.map((curr) => {
            // console.log(curr);
            return (
              <div
                onClick={() => {
                  setShowImage({ image: curr.URL, name: curr.ImageName });
                  setSearch("");
                  setSearchOutput([]);
                }}
                id="searchOutputText"
              >
                <p>{curr.ImageName}</p>
              </div>
            );
          })}
        </div>
      )}
      <ShowFullScreenImage
        image={showImage}
        showImage={showImage}
        setShowImage={setShowImage}
      />
    </div>
  );
};

export default SearchBar;
