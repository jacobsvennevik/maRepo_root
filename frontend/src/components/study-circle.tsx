import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquareIcon, ShareIcon, UsersIcon } from "lucide-react";

const connections = [
  {
    name: "Alex Morgan",
    role: "Study Buddy",
    avatar: "/placeholder.svg?height=24&width=24",
    initials: "AM",
  },
  {
    name: "Dr. Sarah Chen",
    role: "Educator",
    avatar: "/placeholder.svg?height=24&width=24",
    initials: "SC",
  },
  {
    name: "James Wilson",
    role: "Peer Reviewer",
    avatar: "/placeholder.svg?height=24&width=24",
    initials: "JW",
  },
];

export function StudyCircle() {
  return (
    <div className="space-y-1.5">
      {connections.map((connection) => (
        <div key={connection.name} className="flex items-center gap-1.5">
          <Avatar className="h-6 w-6">
            <AvatarImage
              src={connection.avatar || "/placeholder.svg"}
              alt={connection.name}
            />
            <AvatarFallback className="text-[10px]">
              {connection.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="text-xs font-medium">{connection.name}</div>
            <div className="text-[10px] text-slate-500">{connection.role}</div>
          </div>
          <div className="flex gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-ocean hover:bg-ocean-50 hover:text-ocean-700"
            >
              <MessageSquareIcon className="h-2.5 w-2.5" />
              <span className="sr-only">Chat</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-ocean hover:bg-ocean-50 hover:text-ocean-700"
            >
              <ShareIcon className="h-2.5 w-2.5" />
              <span className="sr-only">Share</span>
            </Button>
          </div>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        className="mt-1 w-full gap-1 h-6 text-[10px] border-ocean-200 text-ocean hover:bg-ocean-50 hover:text-ocean-700"
      >
        <UsersIcon className="h-2.5 w-2.5" />
        Find more study partners
      </Button>
    </div>
  );
}
