"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  X,
  Image as ImageIcon,
  Save,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  type Testimonial,
} from "@/lib/testimonials-admin";
import { TestimonialCard } from "@/components/home/TestimonialsClient";
import DeleteConfirmationModal from "@/components/admin/DeleteConfirmationModal";

const MIN_SEARCH_LENGTH = 2;
const DEBOUNCE_DELAY = 400;

export default function ManageTestimonialsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  // Initialize pagination & filters from URL
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialLimit = Number(searchParams.get("limit")) || 20;
  const initialIsActive = searchParams.get("isActive") || "";
  const initialQuery = searchParams.get("q") || "";

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(Math.max(1, initialPage));
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(
    Math.min(200, Math.max(1, initialLimit || 20))
  );
  const [isActiveFilter, setIsActiveFilter] = useState<string>(initialIsActive);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(initialQuery);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState<string | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Refs for cleanup
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isInitialMount = useRef(true);

  // Form state
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  // Helper to sync URL with current state
  const syncUrlWithState = useCallback(
    (
      newPage: number,
      newLimit: number,
      newIsActive: string,
      newQ: string
    ) => {
      // Use window.location.search to avoid circular dependency with searchParams
      const currentParams = new URLSearchParams(window.location.search);
      const params = new URLSearchParams();
      
      // Preserve any other query params
      currentParams.forEach((value, key) => {
        if (key !== "page" && key !== "limit" && key !== "isActive" && key !== "q") {
          params.set(key, value);
        }
      });
      
      params.set("page", newPage.toString());
      params.set("limit", newLimit.toString());

      if (newIsActive) params.set("isActive", newIsActive);
      else params.delete("isActive");

      if (newQ && newQ.trim().length >= MIN_SEARCH_LENGTH) {
        params.set("q", newQ.trim());
      } else {
        params.delete("q");
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router] // Removed searchParams to break circular dependency
  );

  // Debounce search query
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Reset to page 1 when search query changes (but not on initial mount)
    if (page !== 1) {
      setPage(1);
    }
    
    timeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, DEBOUNCE_DELAY);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchQuery]);

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
    const urlIsActive = currentParams.get("isActive") || "";
    const urlQ = currentParams.get("q") || "";

    if (
      page !== urlPage ||
      limit !== urlLimit ||
      isActiveFilter !== urlIsActive ||
      debouncedSearchQuery !== urlQ
    ) {
      syncUrlWithState(page, limit, isActiveFilter, debouncedSearchQuery);
    }
  }, [page, limit, isActiveFilter, debouncedSearchQuery, syncUrlWithState]);

  // Fetch testimonials
  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;
    
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
    
    fetchTestimonials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // NOTE: fetchTestimonials is a stable function that uses page, limit, isActiveFilter, debouncedSearchQuery
    // We intentionally don't include it in deps to avoid issues
  }, [user?.role, user?.id, page, limit, isActiveFilter, debouncedSearchQuery]);

  async function fetchTestimonials() {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    try {
      const result = await getTestimonials({
        page,
        limit,
        isActive:
          isActiveFilter === ""
            ? undefined
            : isActiveFilter === "true",
        search:
          debouncedSearchQuery.trim().length >= MIN_SEARCH_LENGTH
            ? debouncedSearchQuery.trim()
            : undefined,
      });

      if (!abortController.signal.aborted) {
        setTestimonials(result.testimonials);
        setTotal(result.total);
      }
    } catch (error: any) {
      if (error.name === "AbortError" || abortController.signal.aborted) {
        // Reset loading state even if aborted to prevent stuck loader
        setLoading(false);
        return;
      }
      toast.error(
        error?.response?.data?.message || "Failed to load testimonials"
      );
    } finally {
      // Always reset loading state, even if aborted
      if (!abortController.signal.aborted) {
        setLoading(false);
      } else {
        // If aborted, still reset loading state to prevent stuck loader
        setLoading(false);
      }
    }
  }

  function openForm(testimonial?: Testimonial) {
    if (testimonial) {
      setEditingId(testimonial.id);
      setName(testimonial.name);
      setText(testimonial.text);
      setIsActive(testimonial.isActive);
      setImagePreview(testimonial.imageUrl);
      setImageFile(null);
    } else {
      setEditingId(null);
      setName("");
      setText("");
      setIsActive(true);
      setImagePreview(null);
      setImageFile(null);
    }
    setShowForm(true);
  }

  function closeForm() {
    if (submitting) return;
    setShowForm(false);
    setEditingId(null);
    setName("");
    setText("");
    setIsActive(true);
    setImagePreview(null);
    setImageFile(null);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        toast.error("Only PNG, JPG, and JPEG images are allowed");
        e.target.value = ""; // Reset input
        return;
      }

      // Validate file size (10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error("Image size must be less than 10MB");
        e.target.value = ""; // Reset input
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !text.trim()) {
      toast.error("Name and text are required");
      return;
    }

    if (!editingId && !imageFile) {
      toast.error("Image is required");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("text", text.trim());
      formData.append("isActive", String(isActive));
      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (editingId) {
        await updateTestimonial(editingId, formData);
        toast.success("Testimonial updated successfully");
      } else {
        await createTestimonial(formData);
        toast.success("Testimonial created successfully");
      }

      closeForm();
      fetchTestimonials();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to save testimonial"
      );
    } finally {
      setSubmitting(false);
    }
  }

  function openDeleteModal(id: string) {
    setTestimonialToDelete(id);
    setDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    if (deletingId) return;
    setDeleteModalOpen(false);
    setTestimonialToDelete(null);
  }

  async function handleDelete() {
    if (!testimonialToDelete) return;

    setDeletingId(testimonialToDelete);
    try {
      await deleteTestimonial(testimonialToDelete);
      setDeleteModalOpen(false);
      toast.success("Testimonial deleted successfully");
      fetchTestimonials();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to delete testimonial"
      );
    } finally {
      setDeletingId(null);
      setTestimonialToDelete(null);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50/40 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Back to Dashboard */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/admin")}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-emerald-800 mb-2">
              Manage Testimonials
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Add, edit, or remove client testimonials
            </p>
          </div>
          <button
            onClick={() => openForm()}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm sm:shadow-none"
          >
            <Plus className="w-5 h-5" />
            Add Testimonial
          </button>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or text (min 2 characters)..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={isActiveFilter}
              onChange={(e) => {
                setIsActiveFilter(e.target.value);
                setPage(1); // Reset to page 1 when filter changes
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {/* Testimonials Grid */}
        {testimonials.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No testimonials yet</p>
            <p className="text-slate-400 text-sm mt-2">
              Click "Add Testimonial" to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {testimonials && testimonials.length > 0 ? (
              testimonials.map((testimonial) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                >
                  {/* Card with existing TestimonialCard component */}
                  <div className="p-2">
                    <TestimonialCard
                      testimonial={{
                        img: testimonial.imageUrl,
                        name: testimonial.name,
                        text: testimonial.text,
                      }}
                      index={0}
                      isMobile={false}
                    />
                  </div>

                  {/* Overlay buttons */}
                  <div className="absolute top-2 right-2 flex gap-2 z-10">
                    <button
                      onClick={() => openForm(testimonial)}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                      title="Edit"
                      aria-label="Edit testimonial"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(testimonial.id)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
                      title="Delete"
                      aria-label="Delete testimonial"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Active/Inactive badge */}
                  {!testimonial.isActive && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                      Inactive
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-slate-500">
                No testimonials found
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-br from-emerald-50/80 to-white rounded-xl p-5 border-2 border-emerald-200/60 shadow-md shadow-emerald-100/50">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-slate-800">
                Page Size:
              </label>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1); // Reset to page 1 when limit changes
                }}
                className="px-3 py-1.5 border-2 border-emerald-300/60 bg-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-slate-800 shadow-sm hover:border-emerald-400 transition-colors"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>

            {/* Pagination Info */}
            <div className="text-sm font-semibold text-slate-800">
              Showing {(page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, total)} of {total} testimonials
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2.5 border-2 border-emerald-300/60 bg-white rounded-lg hover:bg-emerald-50 hover:border-emerald-400 hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-emerald-300/60 transition-all duration-200 text-emerald-700 font-semibold"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1.5">
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
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          page === pageNum
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-200/50 scale-105"
                            : "border-2 border-emerald-300/60 bg-white hover:bg-emerald-50 hover:border-emerald-400 hover:shadow-sm text-slate-800"
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
                className="p-2.5 border-2 border-emerald-300/60 bg-white rounded-lg hover:bg-emerald-50 hover:border-emerald-400 hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-emerald-300/60 transition-all duration-200 text-emerald-700 font-semibold"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeForm}
                className="fixed inset-0 bg-black/50 z-40"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div
                  className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">
                      {editingId ? "Edit Testimonial" : "Add Testimonial"}
                    </h2>
                    <button
                      onClick={closeForm}
                      disabled={submitting}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Image {!editingId && "*"}
                      </label>
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-64 object-cover rounded-lg border border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setImageFile(null);
                            }}
                            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <ImageIcon className="w-12 h-12 text-slate-400 mb-2" />
                            <p className="text-sm text-slate-600">
                              Click to upload image
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              PNG, JPG, JPEG up to 10MB
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            onChange={handleImageChange}
                            className="hidden"
                            disabled={submitting}
                          />
                        </label>
                      )}
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={submitting}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none disabled:opacity-50"
                        placeholder="Client name"
                      />
                    </div>

                    {/* Text */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Testimonial Text *
                      </label>
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        required
                        disabled={submitting}
                        rows={6}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none disabled:opacity-50 resize-none"
                        placeholder="Client testimonial..."
                      />
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        disabled={submitting}
                        className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                      />
                      <label
                        htmlFor="isActive"
                        className="text-sm font-medium text-slate-700"
                      >
                        Active (visible on website)
                      </label>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            {editingId ? "Update" : "Create"} Testimonial
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={closeForm}
                        disabled={submitting}
                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDelete}
          isLoading={deletingId !== null}
          title="Delete Testimonial"
          message="Are you sure you want to delete this testimonial? This action cannot be undone."
        />
      </div>
    </div>
  );
}
