"use client";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    localStorage.setItem('lastPage', window.location.pathname);
  }, []);
  redirect("/login");
  return null;
}
