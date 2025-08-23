"use client";

import React from "react";
import { logout } from "./store/authSlice";
import { useDispatch, useSelector } from "react-redux";

const Page = () => {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div>
      Scan & Dine
      {user && token && <button onClick={handleLogout}>Logout</button>}
    </div>
  );
};

export default Page;
