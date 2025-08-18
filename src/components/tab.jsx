"use client";
import { useState } from "react";

export default function Tabs({ tabs }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="flex border-b">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`px-4 py-2 -mb-px ${
              active === i
                ? "border-b-2 border-blue-600 font-semibold"
                : "text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">{tabs[active]?.content}</div>
    </div>
  );
}
