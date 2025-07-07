"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ButtonItem } from "@/types/types";
import {
  FaVideo,
  FaLightbulb,
  FaCog,
  FaClipboardCheck,
} from "react-icons/fa";

type Props = {
  title: string;
  items: ButtonItem[];
  currentVideo?: ButtonItem;
  visitedIds?: Set<string>;
  onSelect: (item: ButtonItem) => void;
};

export default function LessonDropdown({
  title,
  items,
  currentVideo,
  visitedIds,
  onSelect,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  // دالة اختيار الأيقونة حسب النوع، مع دعم undefined
  const renderIcon = (type?: string) => {
    switch (type) {
      case "intro":
        return <FaLightbulb className="text-lg ml-2 text-yellow-500" />;
      case "video":
        return <FaVideo className="text-lg ml-2 text-blue-600" />;
      case "activity":
        return <FaCog className="text-lg ml-2 text-green-600" />;
      case "quiz":
        return <FaClipboardCheck className="text-lg ml-2 text-purple-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="mb-2">
      {/* زر الدرس الرئيسي */}
      <Button
        variant="outline"
        className="w-full justify-between text-right px-4 py-2 rounded-xl"
        onClick={() => setExpanded(!expanded)}
      >
        {title}
        <span className="ml-2">{expanded ? "▲" : "▼"}</span>
      </Button>

      {/* قائمة الأزرار الداخلية عند التوسيع */}
      {expanded && (
        <div className="mt-2 space-y-2">
          {items.map((btn, idx) => {
            const isActive = currentVideo?.id === btn.id;
            const isVisited = visitedIds?.has(btn.id);

            return (
              <Button
                key={idx}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start text-right px-4 py-2 rounded-md",
                  isActive && "bg-primary text-white hover:bg-primary/90",
                  !isActive && isVisited && "text-muted-foreground opacity-80 hover:bg-muted",
                  !isActive && !isVisited && "hover:bg-muted"
                )}
                onClick={() => onSelect(btn)}
              >
                {renderIcon(btn.icon)}
                <span className="text-sm truncate">{btn.text}</span>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
