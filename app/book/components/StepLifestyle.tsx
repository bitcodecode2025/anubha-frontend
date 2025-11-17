"use client";

import { useBookingForm } from "../context/BookingFormContext";

export default function StepLifestyle({
  showErrors = false,
}: {
  showErrors?: boolean;
}) {
  const { form, setForm } = useBookingForm();

  const error = (field: any) => showErrors && !field;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Lifestyle & Habits</h3>

      <div className="grid gap-5">
        {/* Bowel Movement */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Bowel movement
          </label>
          <select
            className="input"
            value={form.bowel || ""}
            onChange={(e) => setForm({ bowel: e.target.value })}
          >
            <option value="">Select</option>
            <option>Normal</option>
            <option>Constipation</option>
            <option>Diarrhea</option>
            <option>Irregular</option>
          </select>

          {error(form.bowel) && (
            <p className="text-xs text-red-600 mt-1">This field is required.</p>
          )}
        </div>

        {/* Daily Food Intake */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Daily food intake
          </label>
          <textarea
            rows={3}
            className="input"
            placeholder="What do you eat throughout the day?"
            value={form.dailyFood || ""}
            onChange={(e) => setForm({ dailyFood: e.target.value })}
          />

          {error(form.dailyFood) && (
            <p className="text-xs text-red-600 mt-1">
              Please enter your daily food intake.
            </p>
          )}
        </div>

        {/* Water Intake */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Water intake (liters)
          </label>
          <input
            className="input"
            type="number"
            inputMode="decimal"
            placeholder="e.g., 2.5"
            min={0}
            step="0.1"
            value={form.waterIntake || ""}
            onChange={(e) => setForm({ waterIntake: e.target.value })}
          />

          {error(form.waterIntake) && (
            <p className="text-xs text-red-600 mt-1">
              Enter water intake in liters.
            </p>
          )}
        </div>

        {/* Wake & Sleep Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Wake Up */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Wake up time
            </label>
            <input
              type="time"
              className="input"
              value={form.wakeUpTime || ""}
              onChange={(e) => setForm({ wakeUpTime: e.target.value })}
            />

            {error(form.wakeUpTime) && (
              <p className="text-xs text-red-600 mt-1">Select wake up time.</p>
            )}
          </div>

          {/* Sleep Time */}
          <div>
            <label className="block text-sm font-medium mb-1">Sleep time</label>
            <input
              type="time"
              className="input"
              value={form.sleepTime || ""}
              onChange={(e) => setForm({ sleepTime: e.target.value })}
            />

            {error(form.sleepTime) && (
              <p className="text-xs text-red-600 mt-1">Select sleep time.</p>
            )}
          </div>
        </div>

        {/* Sleep Quality */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Sleep quality
          </label>
          <select
            className="input"
            value={form.sleepQuality || ""}
            onChange={(e) => setForm({ sleepQuality: e.target.value })}
          >
            <option value="">Select</option>
            <option>Normal</option>
            <option>Irregular</option>
            <option>Disturbed</option>
            <option>Insomnia</option>
          </select>

          {error(form.sleepQuality) && (
            <p className="text-xs text-red-600 mt-1">This field is required.</p>
          )}
        </div>
      </div>
    </div>
  );
}
