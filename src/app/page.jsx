"use client";

import React from "react";
import { logout } from "./store/authSlice";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";

const Page = () => {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="flex gap-5">
      Scan & Dine
      {user && token && <button onClick={handleLogout}>Logout</button>}
      <Link href={"/auth/login"}>Login</Link>
    </div>
  );
};

export default Page;
