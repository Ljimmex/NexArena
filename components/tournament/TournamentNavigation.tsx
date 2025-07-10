"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
    { label: "Overview", href: "/overview" },
    { label: "Brackets", href: "/bracket" },
    { label: "Teams", href: "/teams" },
    { label: "Matches", href: "/matches" },
    { label: "Result", href: "/result" },
];

export default function TournamentNavigation() {
    const pathname = usePathname();
    return (
      <nav className="flex h-10 bg-[#181818] rounded-lg shadow-lg mb-6">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex items-center justify-center text-lg font-semibold transition-all
              ${pathname === item.href ? "bg-yellow-500 text-black shadow" : "text-gray-300 hover:bg-[#222]"}
            `}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    );
}