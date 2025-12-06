"use client";

import React from "react";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
} from "lucide-react";
import { AppointmentDetails } from "@/lib/appointments-admin";

interface AppointmentPreviewProps {
  appointment: AppointmentDetails;
}

export default function AppointmentPreview({
  appointment,
}: AppointmentPreviewProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-emerald-200 p-6 mb-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Calendar className="w-6 h-6 text-emerald-600" />
        Appointment Preview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Date & Time */}
        <div className="bg-emerald-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-semibold text-slate-700">
              Date & Time
            </span>
          </div>
          <div className="text-lg font-medium text-slate-900">
            {new Date(appointment.startAt).toLocaleString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        {/* Plan */}
        <div className="bg-emerald-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-semibold text-slate-700">Plan</span>
          </div>
          <div className="text-lg font-medium text-slate-900">
            {appointment.planName}
          </div>
        </div>

        {/* Status */}
        <div className="bg-emerald-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-slate-700">Status</span>
          </div>
          <div className="text-lg font-medium text-slate-900">
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                appointment.status === "CONFIRMED"
                  ? "bg-green-100 text-green-800"
                  : appointment.status === "PENDING"
                  ? "bg-yellow-100 text-yellow-800"
                  : appointment.status === "COMPLETED"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {appointment.status}
            </span>
          </div>
        </div>

        {/* Mode */}
        <div className="bg-emerald-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-slate-700">Mode</span>
          </div>
          <div className="text-lg font-medium text-slate-900">
            {appointment.mode === "IN_PERSON" ? "In Person" : "Online"}
          </div>
        </div>
      </div>

      {/* Patient Information */}
      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-600" />
          Patient Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-slate-600">Name</span>
            <div className="font-medium text-slate-900">
              {appointment.patient.name}
            </div>
          </div>
          <div>
            <span className="text-sm text-slate-600 flex items-center gap-1">
              <Phone className="w-4 h-4" />
              Phone
            </span>
            <div className="font-medium text-slate-900">
              {appointment.patient.phone}
            </div>
          </div>
          <div>
            <span className="text-sm text-slate-600 flex items-center gap-1">
              <Mail className="w-4 h-4" />
              Email
            </span>
            <div className="font-medium text-slate-900">
              {appointment.patient.email}
            </div>
          </div>
          <div>
            <span className="text-sm text-slate-600">Age</span>
            <div className="font-medium text-slate-900">
              {appointment.patient.age} years
            </div>
          </div>
          <div>
            <span className="text-sm text-slate-600">Gender</span>
            <div className="font-medium text-slate-900">
              {appointment.patient.gender}
            </div>
          </div>
          <div>
            <span className="text-sm text-slate-600">Date of Birth</span>
            <div className="font-medium text-slate-900">
              {new Date(appointment.patient.dateOfBirth).toLocaleDateString(
                "en-IN"
              )}
            </div>
          </div>
          <div className="md:col-span-2">
            <span className="text-sm text-slate-600 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Address
            </span>
            <div className="font-medium text-slate-900">
              {appointment.patient.address}
            </div>
          </div>
          <div>
            <span className="text-sm text-slate-600">Weight</span>
            <div className="font-medium text-slate-900">
              {appointment.patient.weight} kg
            </div>
          </div>
          <div>
            <span className="text-sm text-slate-600">Height</span>
            <div className="font-medium text-slate-900">
              {appointment.patient.height} cm
            </div>
          </div>
        </div>

        {/* Medical History */}
        {appointment.patient.medicalHistory && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <span className="text-sm text-slate-600">Medical History</span>
            <div className="font-medium text-slate-900 mt-1">
              {appointment.patient.medicalHistory}
            </div>
          </div>
        )}

        {/* Appointment Concerns */}
        {appointment.patient.appointmentConcerns && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <span className="text-sm text-slate-600">Appointment Concerns</span>
            <div className="font-medium text-slate-900 mt-1">
              {appointment.patient.appointmentConcerns}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
