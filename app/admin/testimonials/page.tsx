"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  X,
  Image as ImageIcon,
  Save,
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

export default function ManageTestimonialsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState<string | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  // Fetch testimonials
  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;
    fetchTestimonials();
  }, [user]);

  async function fetchTestimonials() {
    setLoading(true);
    try {
      const data = await getTestimonials();
      setTestimonials(data);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to load testimonials"
      );
    } finally {
      setLoading(false);
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
