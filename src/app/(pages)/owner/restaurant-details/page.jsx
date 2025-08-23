"use client";

import { logout } from "@/app/store/authSlice";
import React from "react";
import { useDispatch } from "react-redux";

const Page = () => {
  const dispatch = useDispatch();

  return (
    <div>
      Restaurant Details Page
      <div>
        <button onClick={() => dispatch(logout())}>Logout</button>
      </div>
    </div>
  );
};

export default Page;
