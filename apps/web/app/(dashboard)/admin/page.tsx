"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, startImpersonation } from "@/contexts/AuthContext";
import { getAllUsers, updateUserRole } from "@badminton/firebase";
import type { UserRecord } from "@badminton/firebase";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  FiEye,
  FiSearch,
  FiShield,
  FiUser,
  FiUserPlus,
  FiUsers,
  FiX,
} from "react-icons/fi";

function formatDate(ms: number | null): string {
  if (!ms) return "--";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(ms));
}

export default function AdminPage() {
  const { isAdmin, user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleChange, setRoleChange] = useState<{
    uid: string;
    email: string;
    newRole: "admin" | "player";
  } | null>(null);
  const [updatingRole, setUpdatingRole] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace("/home");
    }
  }, [isAdmin, authLoading, router]);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    async function fetchUsers() {
      try {
        const allUsers = await getAllUsers();
        if (!cancelled) setUsers(allUsers);
      } catch {
        if (!cancelled) setError("Failed to load users");
      } finally {
        if (!cancelled) setLoadingUsers(false);
      }
    }
    fetchUsers();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const metrics = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === "admin").length;
    const players = users.filter((u) => u.role === "player").length;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentSignups = users.filter(
      (u) => u.createdAt && u.createdAt > sevenDaysAgo,
    ).length;
    return { total, admins, players, recentSignups };
  }, [users]);

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const lower = search.toLowerCase();
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(lower) ||
        u.clubName.toLowerCase().includes(lower),
    );
  }, [users, search]);

  async function handleRoleChange() {
    if (!roleChange) return;
    setUpdatingRole(true);
    try {
      await updateUserRole(roleChange.uid, roleChange.newRole);
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === roleChange.uid ? { ...u, role: roleChange.newRole } : u,
        ),
      );
    } catch {
      setError("Failed to update role");
    } finally {
      setUpdatingRole(false);
      setRoleChange(null);
    }
  }

  if (authLoading || !isAdmin) {
    return (
      <div className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-6xl">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-6xl">
      <ConfirmDialog
        open={!!roleChange}
        onClose={() => setRoleChange(null)}
        onConfirm={handleRoleChange}
        title="Change User Role"
        message={
          roleChange
            ? `Change ${roleChange.email} to ${roleChange.newRole}?`
            : ""
        }
        confirmLabel={updatingRole ? "Updating..." : "Change Role"}
      />

      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Admin</h1>
        <p className="text-light-300 text-sm mt-1">
          Manage users, roles, and view platform metrics
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-xl px-3 py-2 mb-6 flex items-center gap-2 text-sm">
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-danger/60 hover:text-danger"
          >
            <FiX size={14} />
          </button>
        </div>
      )}

      {loadingUsers ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6">
            <div className="bg-secondary p-3 sm:p-5 rounded-2xl border border-dark-100">
              <h3 className="text-light-300 text-[10px] sm:text-xs mb-1 flex items-center gap-1">
                <FiUsers size={12} /> Total Users
              </h3>
              <p className="text-xl sm:text-3xl font-bold">{metrics.total}</p>
            </div>
            <div className="bg-secondary p-3 sm:p-5 rounded-2xl border border-dark-100">
              <h3 className="text-light-300 text-[10px] sm:text-xs mb-1 flex items-center gap-1">
                <FiShield size={12} /> Admins
              </h3>
              <p className="text-xl sm:text-3xl font-bold text-accent">
                {metrics.admins}
              </p>
            </div>
            <div className="bg-secondary p-3 sm:p-5 rounded-2xl border border-dark-100">
              <h3 className="text-light-300 text-[10px] sm:text-xs mb-1 flex items-center gap-1">
                <FiUser size={12} /> Players
              </h3>
              <p className="text-xl sm:text-3xl font-bold text-info">
                {metrics.players}
              </p>
            </div>
            <div className="bg-secondary p-3 sm:p-5 rounded-2xl border border-dark-100">
              <h3 className="text-light-300 text-[10px] sm:text-xs mb-1 flex items-center gap-1">
                <FiUserPlus size={12} /> Recent Signups
              </h3>
              <p className="text-xl sm:text-3xl font-bold text-success">
                {metrics.recentSignups}
              </p>
              <p className="text-light-300/60 text-[9px] sm:text-[10px]">
                Last 7 days
              </p>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-secondary rounded-2xl border border-dark-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-dark-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FiUsers className="text-accent" size={18} />
                <h2 className="text-sm font-semibold">All Users</h2>
                <span className="text-light-300 text-xs">
                  ({filteredUsers.length})
                </span>
              </div>
              <div className="relative">
                <FiSearch
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-light-300"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="bg-primary border border-dark-100 rounded-lg pl-8 pr-3 py-1.5 text-xs text-light-100 placeholder:text-light-300/50 focus:outline-none focus:border-accent w-40 sm:w-56"
                />
              </div>
            </div>

            {filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-100 text-light-300 text-xs">
                      <th className="text-left px-4 py-2 font-medium">
                        Email
                      </th>
                      <th className="text-left px-4 py-2 font-medium">
                        Club Name
                      </th>
                      <th className="text-center px-2 py-2 font-medium">
                        Role
                      </th>
                      <th className="text-left px-4 py-2 font-medium">
                        Joined
                      </th>
                      <th className="text-center px-2 py-2 font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const isCurrentUser = u.uid === user?.uid;
                      return (
                        <tr
                          key={u.uid}
                          className="border-b border-dark-100 last:border-b-0 hover:bg-dark-200/30"
                        >
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-dark-200 flex items-center justify-center text-light-300 text-xs font-bold shrink-0">
                                {u.email.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-light-100 truncate max-w-[200px]">
                                {u.email}
                              </span>
                              {isCurrentUser && (
                                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-accent/15 text-accent shrink-0">
                                  You
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-light-200 truncate max-w-[150px]">
                            {u.clubName}
                          </td>
                          <td className="text-center px-2 py-2.5">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                u.role === "admin"
                                  ? "bg-accent/15 text-accent"
                                  : "bg-info/15 text-info"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-light-300 text-xs tabular-nums">
                            {formatDate(u.createdAt)}
                          </td>
                          <td className="text-center px-2 py-2.5">
                            <div className="flex items-center justify-center gap-2">
                              <select
                                value={u.role}
                                onChange={(e) =>
                                  setRoleChange({
                                    uid: u.uid,
                                    email: u.email,
                                    newRole: e.target.value as
                                      | "admin"
                                      | "player",
                                  })
                                }
                                disabled={isCurrentUser}
                                className="bg-dark-200 border border-dark-100 rounded-lg px-2 py-1 text-xs text-light-100 focus:outline-none focus:border-accent disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <option value="admin">Admin</option>
                                <option value="player">Player</option>
                              </select>
                              {!isCurrentUser && (
                                <button
                                  onClick={() =>
                                    startImpersonation({
                                      uid: u.uid,
                                      email: u.email,
                                      clubName: u.clubName,
                                    })
                                  }
                                  title="Support Access"
                                  className="p-1.5 rounded-lg bg-warning/10 text-warning hover:bg-warning/20 transition-colors"
                                >
                                  <FiEye size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-light-300 text-sm">
                  {search ? "No users match your search" : "No users found"}
                </p>
                <p className="text-light-300/60 text-xs mt-0.5">
                  {search
                    ? "Try a different search term"
                    : "Users will appear here when they register"}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
