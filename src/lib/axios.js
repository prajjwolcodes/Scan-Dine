"use client";

import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL, // comes from .env.local
  //   withCredentials: true, // if you’re using cookies
});

export default api;
