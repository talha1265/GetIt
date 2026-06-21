import { BadgePercent, Heart, Package, UserPlus } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { users } from "@/lib/mock/data";

const items = [
  {
    id: "n1",
    icon: BadgePercent,
    color: "text-cashback",
    user: users.aria,
    text: "bought from your post — you earned ₹45 cashback",
    time: "2h",
  },
  {
    id: "n2",
    icon: UserPlus,
    color: "text-accent",
    user: users.kabir,
    text: "started following you",
    time: "5h",
  },
  {
    id: "n3",
    icon: Heart,
    color: "text-like",
    user: users.mia,
    text: "liked your reel",
    time: "1d",
  },
  {
    id: "n4",
    icon: Package,
    color: "text-foreground",
    user: users.nova,
    text: "your order has been shipped",
    time: "2d",
  },
];

export default function NotificationsPage() {
  return (
    <div className="p-3">
      <h1 className="px-1 pb-2 text-lg font-bold">Notifications</h1>
      <div className="space-y-1">
        {items.map(({ id, icon: Icon, color, user, text, time }) => (
          <div key={id} className="flex items-center gap-3 rounded-2xl p-2.5 hover:bg-surface-muted">
            <div className="relative">
              <Avatar user={user} size="md" />
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-surface ring-1 ring-border">
                <Icon className={`h-3 w-3 ${color}`} fill="currentColor" />
              </span>
            </div>
            <p className="flex-1 text-sm leading-snug">
              <span className="font-semibold">{user.username}</span> {text}
              <span className="ml-1 text-xs text-muted">{time}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
