"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  Loader2,
  ArrowLeft,
  Search,
  UserPlus,
  CalendarPlus,
  Users as UsersIcon,
  Mail,
  Phone,
  X,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { listUsers, AdminUser, deleteUser } from "@/lib/admin-users";

const MIN_SEARCH_LENGTH = 2;
const DEBOUNCE_DELAY = 400;

function UserCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-emerald-200/50 p-6 animate-pulse">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="h-6 w-2/3 bg-slate-200 rounded mb-3" />
          <div className="space-y-2">
            <div className="h-4 w-3/4 bg-slate-200 rounded" />
            <div className="h-4 w-1/2 bg-slate-200 rounded" />
            <div className="h-4 w-2/3 bg-slate-200 rounded" />
          </div>
        </div>
        <div className="h-9 w-9 bg-slate-200 rounded-lg" />
      </div>
      <div className="h-10 w-full bg-slate-200 rounded-lg" />
    </div>
  );
}

export default function ManageUsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  // Initialize pagination & filters from URL
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialLimit = Number(searchParams.get("limit")) || 20;
  const initialQuery = searchParams.get("q") || "";

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(Math.max(1, initialPage));
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(
    Math.min(200, Math.max(1, initialLimit || 20))
  );
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  
  // Track if initial data has been loaded to prevent flash of empty state
  const hasLoadedInitialData = useRef(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    userId: string | null;
    userName: string | null;
  }>({
    isOpen: false,
    userId: null,
    userName: null,
  });
  const [deleting, setDeleting] = useState(false);

  // Refs for cleanup and cancellation
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isInitialMount = useRef(true);
  const isSearchTriggeredPageReset = useRef(false);

  // Helper to sync URL with current state
  const syncUrlWithState = useCallback(
    (
      newPage: number,
      newLimit: number,
      newQ: string
    ) => {
      // Get current params to preserve other query params
      const currentParams = new URLSearchParams(window.location.search);
      const params = new URLSearchParams();
      
      // Preserve any other query params (like date, etc.)
      currentParams.forEach((value, key) => {
        if (key !== "page" && key !== "limit" && key !== "q") {
          params.set(key, value);
        }
      });
      
      params.set("page", newPage.toString());
      params.set("limit", newLimit.toString());

      if (newQ && newQ.trim().length >= MIN_SEARCH_LENGTH) {
        params.set("q", newQ.trim());
      } else {
        params.delete("q");
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router]
  );

  // Fetch users with cancellation support
  const fetchUsers = useCallback(async (search?: string) => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Set loading states
    setLoading(true);
    if (search) {
      setSearching(true);
    }

    try {
      const result = await listUsers(search, {
        signal: abortController.signal,
        page,
        limit,
      });

      // Only update state if request wasn't cancelled
      if (!abortController.signal.aborted) {
        // Update all state together - React 18 automatically batches these
        // This prevents intermediate renders that cause flashing
        // Use a single synchronous batch of updates
        hasLoadedInitialData.current = true;
        setUsers(result.users);
        setTotal(result.total);
        setLoading(false);
        setSearching(false);
      }
    } catch (error: any) {
      // Ignore abort errors
      if (error.name === "AbortError" || abortController.signal.aborted) {
        // Reset loading state even if aborted to prevent stuck loader
        setLoading(false);
        setSearching(false);
        return;
      }
      // On error, show empty state (users array stays as is)
      hasLoadedInitialData.current = true;
      setLoading(false);
      setSearching(false);
      toast.error(error?.response?.data?.message || "Failed to load users");
    }
  }, [page, limit]);

  // Effect to update URL when state changes (skip initial mount to prevent loops)
  useEffect(() => {
    // Skip on initial mount - URL is already set correctly from URL params
    if (isInitialMount.current) {
      return;
    }

    // Only sync if values differ from current URL (use window.location to avoid dependency on searchParams)
    const currentParams = new URLSearchParams(window.location.search);
    const urlPage = Number(currentParams.get("page")) || 1;
    const urlLimit = Number(currentParams.get("limit")) || 20;
    const urlQ = currentParams.get("q") || "";

    if (
      page !== urlPage ||
      limit !== urlLimit ||
      searchQuery !== urlQ
    ) {
      syncUrlWithState(page, limit, searchQuery);
    }
  }, [page, limit, searchQuery, syncUrlWithState]);

  // Initial load and when pagination changes (but not when search changes - that's handled separately)
  useEffect(() => {
    // Don't fetch until user is authenticated and is admin
    if (!user || user.role !== "ADMIN") {
      return;
    }

    if (isInitialMount.current) {
      isInitialMount.current = false;
      // On initial mount, fetch with current search query from URL
      const urlSearch = searchParams.get("q") || "";
      if (urlSearch.trim().length >= MIN_SEARCH_LENGTH) {
        fetchUsers(urlSearch.trim());
      } else {
        fetchUsers();
      }
    } else {
      // Skip if page change was triggered by search (search effect will handle the fetch)
      if (isSearchTriggeredPageReset.current) {
        isSearchTriggeredPageReset.current = false;
        return;
      }
      // When pagination changes, include current search query
      const currentSearch = searchQuery.trim().length >= MIN_SEARCH_LENGTH 
        ? searchQuery.trim() 
        : undefined;
      fetchUsers(currentSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // NOTE: fetchUsers is intentionally in dependencies via useCallback with [page, limit]
    // We don't want to add searchQuery/searchParams to avoid infinite loops
  }, [user?.role, user?.id, page, limit]);

  // Search with debounce and minimum length
  useEffect(() => {
    // Skip on initial mount (handled by pagination effect)
    if (isInitialMount.current) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const trimmedQuery = searchQuery.trim();
    const shouldSearch = trimmedQuery.length >= MIN_SEARCH_LENGTH;
    const isInitialEmptySearch = trimmedQuery.length === 0;

    // Reset to page 1 when search changes
    if (page !== 1) {
      isSearchTriggeredPageReset.current = true;
      setPage(1);
    }

    // If query is cleared, fetch all users
    if (isInitialEmptySearch) {
      setSearching(false);
      timeoutRef.current = setTimeout(() => {
        fetchUsers();
      }, DEBOUNCE_DELAY);
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    }

    // If query is too short, don't search but reset searching state
    if (!shouldSearch) {
      setSearching(false);
      return;
    }

    // Set searching state immediately for better UX
    setSearching(true);

    // Debounce the API call
    timeoutRef.current = setTimeout(() => {
      fetchUsers(trimmedQuery);
    }, DEBOUNCE_DELAY);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [searchQuery]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Route protection
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/login");
        return;
      }
      if (user.role !== "ADMIN") {
        router.replace("/");
        return;
      }
    }
  }, [user, authLoading, router]);

  // Don't render content until auth is resolved
  if (authLoading) {
    return (
      <main className="min-h-[70vh] px-6 sm:px-8 lg:px-16 py-16 bg-gradient-to-b from-white to-emerald-50/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <UserCardSkeleton key={idx} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!authLoading && (!user || user.role !== "ADMIN")) {
    return null;
  }

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleCreateAppointment = (userId: string) => {
    router.push(`/admin/users/${userId}/appointment`);
  };

  const handleDeleteClick = (userId: string, userName: string) => {
    setDeleteModal({
      isOpen: true,
      userId,
      userName,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.userId) return;

    setDeleting(true);
    try {
      await deleteUser(deleteModal.userId);
      toast.success("User deleted successfully");
      // Remove user from UI
      setUsers((prev) => prev.filter((u) => u.id !== deleteModal.userId));
      // Close modal
      setDeleteModal({ isOpen: false, userId: null, userName: null });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, userId: null, userName: null });
  };

  return (
    <main className="min-h-[70vh] px-6 sm:px-8 lg:px-16 py-16 bg-gradient-to-b from-white to-emerald-50/40">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/admin")}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                Manage Users
              </h1>
              <p className="text-slate-600">
                View all users and create appointments on their behalf
              </p>
            </div>
            <button
              onClick={() => router.push("/admin/users/create")}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>Create User</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, or email (min 2 characters)..."
              className="w-full pl-10 pr-10 py-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              autoComplete="off"
            />
            {/* Removed spinner - skeleton loaders in the grid show loading state */}
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {searchQuery.trim().length > 0 &&
            searchQuery.trim().length < MIN_SEARCH_LENGTH && (
              <p className="mt-2 text-sm text-slate-500">
                Type at least {MIN_SEARCH_LENGTH} characters to search
              </p>
            )}
        </div>

        {/* Users List */}
        {loading || authLoading || !hasLoadedInitialData.current ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <UserCardSkeleton key={idx} />
            ))}
          </div>
        ) : !loading && !authLoading && hasLoadedInitialData.current && users.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-emerald-200/50 p-12 text-center">
            <UsersIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No users found
            </h3>
            <p className="text-slate-600 mb-6">
              {searchQuery
                ? "No users match your search criteria"
                : "Create a new user to get started"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push("/admin/users/create")}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold flex items-center gap-2 mx-auto"
              >
                <UserPlus className="w-5 h-5" />
                <span>Create User</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-2xl shadow-xl border-2 border-emerald-200/50 p-6 hover:shadow-2xl transition-shadow relative"
              >
                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleDeleteClick(user.id, user.name)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label={`Delete user ${user.name}`}
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                <div className="mb-4 pr-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {user.name}
                  </h3>
                  <div className="space-y-2">
                    {user.phone && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{user.phone}</span>
                      </div>
                    )}
                    {user.email && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-600">
                      <UsersIcon className="w-4 h-4" />
                      <span className="text-sm">
                        {user.patientCount}{" "}
                        {user.patientCount === 1 ? "patient" : "patients"}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleCreateAppointment(user.id)}
                  className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <CalendarPlus className="w-5 h-5" />
                  <span>Create Appointment</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl p-4 border border-emerald-200">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-700 font-medium">
                Page Size:
              </label>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1); // Reset to page 1 when limit changes
                }}
                className="px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>

            {/* Pagination Info */}
            <div className="text-sm text-slate-600">
              Showing {(page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, total)} of {total} users
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, Math.ceil(total / limit)) },
                  (_, i) => {
                    const totalPages = Math.ceil(total / limit);
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          page === pageNum
                            ? "bg-emerald-600 text-white"
                            : "border border-slate-300 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}
              </div>

              <button
                onClick={() =>
                  setPage((p) => Math.min(Math.ceil(total / limit), p + 1))
                }
                disabled={page >= Math.ceil(total / limit)}
                className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-red-200"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Delete User
                  </h3>
                  <p className="text-sm text-slate-600">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p className="text-slate-700 mb-6">
                Do you want to delete this user{" "}
                <span className="font-semibold">{deleteModal.userName}</span>?
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleDeleteCancel}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    "Confirm"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
