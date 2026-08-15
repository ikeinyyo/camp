/* eslint-disable @next/next/no-img-element */
import type { User } from "@/lib/users";

export function UserAvatar({ user, className = "h-11 w-11", textClassName = "text-base" }: { user: Pick<User, "displayName" | "avatarUrl">; className?: string; textClassName?: string }) {
  const base = `${className} shrink-0 overflow-hidden rounded-full ring-2 ring-white/80 shadow-sm`;
  if (user.avatarUrl) return <img src={user.avatarUrl} alt={`Avatar de ${user.displayName}`} className={`${base} object-cover`} />;
  return <span aria-label={`Avatar de ${user.displayName}`} className={`${base} grid place-items-center bg-[var(--primary)] font-black uppercase text-white ${textClassName}`}>{user.displayName.trim().charAt(0) || "?"}</span>;
}
