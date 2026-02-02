"use client";

import React, { useMemo } from "react";
import type { DoctorNotesFormData } from "@/lib/doctor-notes-api";
import { FieldDisplay } from "./shared-helpers";

interface FoodRecallSectionProps {
  formData: Pick<
    DoctorNotesFormData,
    | "morningIntake"
    | "breakfast"
    | "midMorning"
    | "lunch"
    | "midDay"
    | "eveningSnack"
    | "dinner"
  >;
}

const FoodRecallSection = ({ formData }: FoodRecallSectionProps) => {
  // Memoize check for whether section has data
  const hasData = useMemo(() => {
    return !!(
      formData.morningIntake ||
      formData.breakfast ||
      formData.midMorning ||
      formData.lunch ||
      formData.midDay ||
      formData.eveningSnack ||
      formData.dinner
    );
  }, [formData]);

  // Memoize breakfast items list
  const breakfastItems = useMemo(
    () => [
      { key: "poha", label: "Poha" },
      { key: "upma", label: "Upma" },
      { key: "paratha", label: "Paratha" },
      { key: "stuffedparatha", label: "Stuffed Paratha" },
      { key: "puri", label: "Puri" },
      { key: "idlydosa", label: "Idly/Dosa" },
      { key: "breadbutter", label: "Bread Butter" },
      { key: "sandwich", label: "Sandwich" },
      { key: "egg", label: "Egg" },
      { key: "juice", label: "Juice" },
      { key: "fruits", label: "Fruits" },
      { key: "milk", label: "Milk" },
    ],
    []
  );

  // Memoize mid morning items list
  const midMorningItems = useMemo(
    () => [
      { key: "buttermilk", label: "Buttermilk" },
      { key: "curd", label: "Curd" },
      { key: "fruit", label: "Fruit" },
      { key: "teacoffee", label: "Tea/Coffee" },
      { key: "other", label: "Other" },
    ],
    []
  );

  // Memoize evening snack items
  const eveningSnackSimpleItems = useMemo(
    () => ["biscuittoast", "namkeen", "chana", "makhana", "groundnuts"],
    []
  );

  const eveningSnackBowlsItems = useMemo(
    () => ["poha", "upma", "sandwich", "dosa"],
    []
  );

  if (!hasData) return null;

  return (
    <div className="mb-6 pb-6 border-b border-slate-200">
      <h4 className="text-lg font-semibold text-emerald-700 mb-4">
        Section 2 — 24-Hour Food Recall
      </h4>
      <div className="space-y-4">
        {/* Morning Intake */}
        {formData.morningIntake &&
          Object.keys(formData.morningIntake).length > 0 && (
            <div className="bg-slate-50 rounded-lg p-4">
              <h5 className="font-semibold text-slate-700 mb-3">
                Morning Intake
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FieldDisplay
                  label="Time"
                  value={formData.morningIntake.time}
                />
                {(formData.morningIntake.waterIntake !== undefined && formData.morningIntake.waterIntake !== null) && (
                  <FieldDisplay
                    label="Overall Water Intake Throughout the Day"
                    value={formData.morningIntake.waterIntake}
                    unit="L"
                  />
                )}
                <div className="md:col-span-2">
                  <FieldDisplay
                    label="Medicines"
                    value={formData.morningIntake.medicines}
                  />
                </div>
                {formData.morningIntake.extraNotes && (
                  <div className="md:col-span-2">
                    <FieldDisplay
                      label="Extra Notes"
                      value={formData.morningIntake.extraNotes}
                    />
                  </div>
                )}
                {formData.morningIntake.tea !== undefined && (
                  <div className="bg-white rounded p-2">
                    <div className="font-medium text-slate-900">
                      Tea:{" "}
                      {formData.morningIntake.tea?.checked ? "Yes" : "No"}
                    </div>
                    {formData.morningIntake.tea?.checked &&
                      formData.morningIntake.tea.type && (
                        <div className="text-sm text-slate-600">
                          Type: {formData.morningIntake.tea.type}
                        </div>
                      )}
                  </div>
                )}
                {formData.morningIntake.coffee !== undefined && (
                  <div className="bg-white rounded p-2">
                    <div className="font-medium text-slate-900">
                      ☕ Coffee:{" "}
                      {formData.morningIntake.coffee?.checked ? "Yes" : "No"}
                    </div>
                  </div>
                )}
                {formData.morningIntake.lemonWater !== undefined && (
                  <div className="bg-white rounded p-2">
                    <div className="font-medium text-slate-900">
                      🍋 Lemon Water:{" "}
                      {formData.morningIntake.lemonWater?.checked
                        ? "Yes"
                        : "No"}
                    </div>
                  </div>
                )}
                {formData.morningIntake.garlicHerbs !== undefined && (
                  <div className="bg-white rounded p-2">
                    <div className="font-medium text-slate-900">
                      Garlic & Herbs:{" "}
                      {formData.morningIntake.garlicHerbs?.checked
                        ? "Yes"
                        : "No"}
                    </div>
                    {formData.morningIntake.garlicHerbs?.checked &&
                      formData.morningIntake.garlicHerbs.types && (
                        <div className="text-sm text-slate-600">
                          Types: {formData.morningIntake.garlicHerbs.types}
                        </div>
                      )}
                  </div>
                )}
                {formData.morningIntake.soakedDryFruits !== undefined && (
                  <div className="bg-white rounded p-2">
                    <div className="font-medium text-slate-900">
                      Soaked Dry Fruits:{" "}
                      {formData.morningIntake.soakedDryFruits?.checked
                        ? "Yes"
                        : "No"}
                    </div>
                    {formData.morningIntake.soakedDryFruits?.checked &&
                      formData.morningIntake.soakedDryFruits.quantity && (
                        <div className="text-sm text-slate-600">
                          Quantity:{" "}
                          {formData.morningIntake.soakedDryFruits.quantity}
                        </div>
                      )}
                  </div>
                )}
                {formData.morningIntake.biscuitToast !== undefined && (
                  <div className="bg-white rounded p-2">
                    <div className="font-medium text-slate-900">
                      Biscuit/Toast:{" "}
                      {formData.morningIntake.biscuitToast?.checked
                        ? "Yes"
                        : "No"}
                    </div>
                    {formData.morningIntake.biscuitToast?.checked &&
                      formData.morningIntake.biscuitToast.quantity && (
                        <div className="text-sm text-slate-600">
                          Quantity:{" "}
                          {formData.morningIntake.biscuitToast.quantity}
                        </div>
                      )}
                  </div>
                )}
                <FieldDisplay
                  label="Fruits"
                  value={formData.morningIntake.fruits}
                />
                <FieldDisplay
                  label="Fruit Quantity"
                  value={formData.morningIntake.fruitQuantity}
                />
              </div>
            </div>
          )}

        {/* Breakfast */}
        {formData.breakfast &&
          Object.keys(formData.breakfast).length > 0 && (
            <div className="bg-slate-50 rounded-lg p-4">
              <h5 className="font-semibold text-slate-700 mb-3">Breakfast</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {formData.breakfast.time && (
                  <FieldDisplay label="Time" value={formData.breakfast.time} />
                )}

                {breakfastItems.map(({ key, label }) => {
                  const item = (formData.breakfast as any)[key];
                  const isChecked = item?.checked === true;
                  return (
                    <div key={key} className="bg-white rounded p-2">
                      <div className="font-medium text-slate-900">
                        {label}: {isChecked ? "Yes" : "No"}
                      </div>
                      {isChecked && item.quantity && (
                        <div className="text-sm text-slate-600">
                          Quantity: {item.quantity}
                        </div>
                      )}
                    </div>
                  );
                })}

                {formData.breakfast.roti !== undefined && (
                  <div className="bg-white rounded p-2">
                    <div className="font-medium text-slate-900">
                      🍞 Roti:{" "}
                      {formData.breakfast.roti?.checked ? "Yes" : "No"}
                    </div>
                    {formData.breakfast.roti?.checked &&
                      formData.breakfast.roti.ghee && (
                        <div className="text-sm text-slate-600">
                          Ghee: {formData.breakfast.roti.ghee}
                        </div>
                      )}
                  </div>
                )}

                {formData.breakfast.items &&
                  Array.isArray(formData.breakfast.items) &&
                  formData.breakfast.items
                    .filter((item: any) => item.checked)
                    .map((item: any, idx: number) => (
                      <div key={idx} className="bg-white rounded p-2">
                        <div className="font-medium text-slate-900">
                          {item.name}
                        </div>
                        {item.quantity && (
                          <div className="text-sm text-slate-600">
                            Quantity: {item.quantity}
                          </div>
                        )}
                      </div>
                    ))}

                {formData.breakfast.other && (
                  <div className="md:col-span-2">
                    <FieldDisplay
                      label="Other"
                      value={formData.breakfast.other}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Mid Morning */}
        {formData.midMorning &&
          Object.keys(formData.midMorning).length > 0 && (
            <div className="bg-slate-50 rounded-lg p-4">
              <h5 className="font-semibold text-slate-700 mb-3">
                Mid Morning
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {formData.midMorning.time && (
                  <FieldDisplay
                    label="Time"
                    value={formData.midMorning.time}
                  />
                )}

                {midMorningItems.map(({ key, label }) => {
                  const item = (formData.midMorning as any)[key];
                  const isChecked = item?.checked === true;
                  return (
                    <div key={key} className="bg-white rounded p-2">
                      <div className="font-medium text-slate-900">
                        {label}: {isChecked ? "Yes" : "No"}
                      </div>
                      {isChecked && item.quantity && (
                        <div className="text-sm text-slate-600">
                          Quantity: {item.quantity}
                        </div>
                      )}
                    </div>
                  );
                })}

                {formData.midMorning.items &&
                  Array.isArray(formData.midMorning.items) &&
                  formData.midMorning.items
                    .filter((item: any) => item.checked)
                    .map((item: any, idx: number) => (
                      <div key={idx} className="bg-white rounded p-2">
                        <div className="font-medium text-slate-900">
                          {item.name}
                        </div>
                        {item.quantity && (
                          <div className="text-sm text-slate-600">
                            Quantity: {item.quantity}
                          </div>
                        )}
                      </div>
                    ))}
              </div>
            </div>
          )}

        {/* Lunch */}
        {formData.lunch && Object.keys(formData.lunch).length > 0 && (
          <div className="bg-slate-50 rounded-lg p-4">
            <h5 className="font-semibold text-slate-700 mb-3">Lunch</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FieldDisplay label="Time" value={formData.lunch.time} />
              {formData.lunch.rice?.bowls && (
                <FieldDisplay
                  label="Rice"
                  value={`${formData.lunch.rice.bowls} bowls`}
                />
              )}
              {formData.lunch.rice?.type && (
                <FieldDisplay
                  label="Rice Type"
                  value={formData.lunch.rice.type}
                />
              )}
              {formData.lunch.roti?.count && (
                <FieldDisplay
                  label="Roti"
                  value={`${formData.lunch.roti.count} pieces`}
                />
              )}
              {formData.lunch.roti?.type && (
                <FieldDisplay
                  label="Roti Type"
                  value={formData.lunch.roti.type}
                />
              )}
              {formData.lunch.vegetable && (
                <FieldDisplay
                  label="Vegetable"
                  value={formData.lunch.vegetable}
                />
              )}
              {formData.lunch.vegetableType && (
                <FieldDisplay
                  label="Vegetable Type"
                  value={formData.lunch.vegetableType}
                />
              )}
              {formData.lunch.vegetableCount && (
                <FieldDisplay
                  label="Vegetable Count"
                  value={`${formData.lunch.vegetableCount} bowls`}
                />
              )}
              {formData.lunch.dal?.bowls && (
                <FieldDisplay
                  label="Dal"
                  value={`${formData.lunch.dal.bowls} bowls`}
                />
              )}
              {formData.lunch.dal?.type && (
                <FieldDisplay
                  label="Dal Type"
                  value={formData.lunch.dal.type}
                />
              )}
              {formData.lunch.dal?.otherType && (
                <div className="md:col-span-2">
                  <FieldDisplay
                    label="Other Dal Type"
                    value={formData.lunch.dal.otherType}
                  />
                </div>
              )}
              {formData.lunch.sambhar?.bowls && (
                <FieldDisplay
                  label="Sambhar"
                  value={`${formData.lunch.sambhar.bowls} bowls`}
                />
              )}
              {formData.lunch.sambhar?.type && (
                <FieldDisplay
                  label="Sambhar Type"
                  value={formData.lunch.sambhar.type}
                />
              )}
              {formData.lunch.sambhar?.otherType && (
                <div className="md:col-span-2">
                  <FieldDisplay
                    label="Other Sambhar Type"
                    value={formData.lunch.sambhar.otherType}
                  />
                </div>
              )}
              {formData.lunch.curdKadhi?.bowls && (
                <FieldDisplay
                  label="Curd/Kadhi"
                  value={`${formData.lunch.curdKadhi.bowls} bowls`}
                />
              )}
              {formData.lunch.choleRajmaBeans?.bowls && (
                <FieldDisplay
                  label="Chole/Rajma/Beans"
                  value={`${formData.lunch.choleRajmaBeans.bowls} bowls`}
                />
              )}
              {formData.lunch.chicken?.checked && (
                <FieldDisplay
                  label="Chicken"
                  value={formData.lunch.chicken.quantity}
                />
              )}
              {formData.lunch.fish?.checked && (
                <FieldDisplay
                  label="Fish"
                  value={formData.lunch.fish.quantity}
                />
              )}
              {formData.lunch.mutton?.checked && (
                <FieldDisplay
                  label="Mutton"
                  value={formData.lunch.mutton.quantity}
                />
              )}
              {formData.lunch.seafood?.checked && (
                <FieldDisplay
                  label="Seafood"
                  value={formData.lunch.seafood.quantity}
                />
              )}
              {formData.lunch.pulao?.checked && (
                <FieldDisplay
                  label="Pulao"
                  value={`${formData.lunch.pulao.bowls} bowls`}
                />
              )}
              {formData.lunch.khichdi?.checked && (
                <FieldDisplay
                  label="Khichdi"
                  value={`${formData.lunch.khichdi.bowls} bowls`}
                />
              )}
              {formData.lunch.biryani?.checked && (
                <FieldDisplay
                  label="Biryani"
                  value={`${formData.lunch.biryani.bowls} bowls`}
                />
              )}
              {formData.lunch.salad !== undefined && (
                <div className="bg-white rounded p-2">
                  <div className="font-medium text-slate-900">
                    🥗 Salad:{" "}
                    {formData.lunch.salad?.checked ? "Yes" : "No"}
                  </div>
                  {formData.lunch.salad?.checked &&
                    formData.lunch.salad.type && (
                      <div className="text-sm text-slate-600">
                        Type: {formData.lunch.salad.type}
                      </div>
                    )}
                  {formData.lunch.salad?.checked &&
                    formData.lunch.salad.quantity && (
                      <div className="text-sm text-slate-600">
                        Quantity: {formData.lunch.salad.quantity}
                      </div>
                    )}
                </div>
              )}
              {formData.lunch.chutney !== undefined && (
                <div className="bg-white rounded p-2">
                  <div className="font-medium text-slate-900">
                    Chutney:{" "}
                    {formData.lunch.chutney?.checked ? "Yes" : "No"}
                  </div>
                  {formData.lunch.chutney?.checked &&
                    formData.lunch.chutney.type && (
                      <div className="text-sm text-slate-600">
                        Type: {formData.lunch.chutney.type}
                      </div>
                    )}
                </div>
              )}
              {formData.lunch.pickle !== undefined && (
                <div className="bg-white rounded p-2">
                  <div className="font-medium text-slate-900">
                    🥒 Pickle:{" "}
                    {formData.lunch.pickle?.checked ? "Yes" : "No"}
                  </div>
                </div>
              )}
              <div className="md:col-span-2">
                <FieldDisplay label="Other" value={formData.lunch.other} />
              </div>
              <div className="md:col-span-2">
                <FieldDisplay
                  label="Other Quantity"
                  value={formData.lunch.otherQuantity}
                />
              </div>
            </div>
          </div>
        )}

        {/* Mid Day */}
        {formData.midDay && Object.keys(formData.midDay).length > 0 && (
          <div className="bg-slate-50 rounded-lg p-4">
            <h5 className="font-semibold text-slate-700 mb-3">Mid Day</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {formData.midDay.time && (
                <FieldDisplay label="Time" value={formData.midDay.time} />
              )}
              {formData.midDay.sweets?.checked && (
                <div className="bg-white rounded p-2">
                  <div className="font-medium text-slate-900">Sweets</div>
                  {formData.midDay.sweets.bowls ? (
                    <div className="text-sm text-slate-600">
                      {formData.midDay.sweets.bowls} pieces
                    </div>
                  ) : (
                    <div className="text-sm text-emerald-600">Yes</div>
                  )}
                </div>
              )}
              {formData.midDay.dessert?.checked && (
                <div className="bg-white rounded p-2">
                  <div className="font-medium text-slate-900">Dessert</div>
                  {formData.midDay.dessert.bowls ? (
                    <div className="text-sm text-slate-600">
                      {formData.midDay.dessert.bowls} pieces
                    </div>
                  ) : (
                    <div className="text-sm text-emerald-600">Yes</div>
                  )}
                </div>
              )}
              {formData.midDay.laddu?.checked && (
                <div className="bg-white rounded p-2">
                  <div className="font-medium text-slate-900">Laddu</div>
                  {formData.midDay.laddu.bowls ? (
                    <div className="text-sm text-slate-600">
                      {formData.midDay.laddu.bowls} pieces
                    </div>
                  ) : (
                    <div className="text-sm text-emerald-600">Yes</div>
                  )}
                </div>
              )}
              {formData.midDay.fruits?.checked && (
                <div className="bg-white rounded p-2">
                  <div className="font-medium text-slate-900">Fruits</div>
                  {formData.midDay.fruits.bowls ? (
                    <div className="text-sm text-slate-600">
                      {formData.midDay.fruits.bowls} pieces
                    </div>
                  ) : (
                    <div className="text-sm text-emerald-600">Yes</div>
                  )}
                </div>
              )}
              {formData.midDay.other && (
                <div className="md:col-span-2">
                  <FieldDisplay label="Other" value={formData.midDay.other} />
                </div>
              )}
              {formData.midDay.otherQuantity && (
                <div className="md:col-span-2">
                  <FieldDisplay
                    label="Other Quantity"
                    value={formData.midDay.otherQuantity}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Evening Snack */}
        {formData.eveningSnack &&
          Object.keys(formData.eveningSnack).length > 0 && (
            <div className="bg-slate-50 rounded-lg p-4">
              <h5 className="font-semibold text-slate-700 mb-3">
                Evening Snack
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FieldDisplay
                  label="Time"
                  value={formData.eveningSnack.time}
                />

                {formData.eveningSnack.items &&
                  Array.isArray(formData.eveningSnack.items) &&
                  formData.eveningSnack.items
                    .filter((item: any) => item.checked)
                    .map((item: any, idx: number) => (
                      <div key={idx} className="bg-white rounded p-2">
                        <div className="font-medium text-slate-900">
                          {item.name}
                        </div>
                        {item.quantity && (
                          <div className="text-sm text-slate-600">
                            Quantity: {item.quantity}
                          </div>
                        )}
                      </div>
                    ))}

                {eveningSnackSimpleItems.map((itemKey) => {
                  const item = (formData.eveningSnack as any)[itemKey];
                  const isChecked = item?.checked === true;
                  const label =
                    itemKey.charAt(0).toUpperCase() +
                    itemKey.slice(1).replace(/([A-Z])/g, " $1");
                  return (
                    <div key={itemKey} className="bg-white rounded p-2">
                      <div className="font-medium text-slate-900">
                        {label}: {isChecked ? "Yes" : "No"}
                      </div>
                      {isChecked && item.quantity && (
                        <div className="text-sm text-slate-600">
                          Quantity: {item.quantity}
                        </div>
                      )}
                    </div>
                  );
                })}

                {eveningSnackBowlsItems.map((itemKey) => {
                  const item = (formData.eveningSnack as any)[itemKey];
                  const isChecked = item?.checked === true;
                  const label =
                    itemKey.charAt(0).toUpperCase() + itemKey.slice(1);
                  const unit =
                    itemKey === "sandwich" || itemKey === "dosa"
                      ? "pieces"
                      : "bowls";
                  return (
                    <div key={itemKey} className="bg-white rounded p-2">
                      <div className="font-medium text-slate-900">
                        {label}: {isChecked ? "Yes" : "No"}
                      </div>
                      {isChecked && item.bowls && (
                        <div className="text-sm text-slate-600">
                          {item.bowls} {unit}
                        </div>
                      )}
                    </div>
                  );
                })}

                {(formData.eveningSnack as any).teaCoffee !== undefined && (
                  <div className="bg-white rounded p-2">
                    <div className="font-medium text-slate-900">
                      ☕ Tea/Coffee:{" "}
                      {(formData.eveningSnack as any).teaCoffee?.checked
                        ? "Yes"
                        : "No"}
                    </div>
                  </div>
                )}
                {(formData.eveningSnack as any).milk !== undefined && (
                  <div className="bg-white rounded p-2">
                    <div className="font-medium text-slate-900">
                      🥛 Milk:{" "}
                      {(formData.eveningSnack as any).milk?.checked
                        ? "Yes"
                        : "No"}
                    </div>
                  </div>
                )}
                {formData.eveningSnack.other && (
                  <div className="md:col-span-2">
                    <FieldDisplay
                      label="Other"
                      value={formData.eveningSnack.other}
                    />
                  </div>
                )}
                {formData.eveningSnack.otherQuantity && (
                  <div className="md:col-span-2">
                    <FieldDisplay
                      label="Other Quantity"
                      value={formData.eveningSnack.otherQuantity}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Dinner - Same structure as Lunch + Mid-Day */}
        {formData.dinner && Object.keys(formData.dinner).length > 0 && (
          <div className="bg-slate-50 rounded-lg p-4">
            <h5 className="font-semibold text-slate-700 mb-3">Dinner</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FieldDisplay label="Time" value={formData.dinner.time} />
              {formData.dinner.rice?.bowls && (
                <FieldDisplay
                  label="Rice"
                  value={`${formData.dinner.rice.bowls} bowls`}
                />
              )}
              {formData.dinner.rice?.type && (
                <FieldDisplay
                  label="Rice Type"
                  value={formData.dinner.rice.type}
                />
              )}
              {formData.dinner.roti?.count && (
                <FieldDisplay
                  label="Roti"
                  value={`${formData.dinner.roti.count} pieces`}
                />
              )}
              {formData.dinner.roti?.type && (
                <FieldDisplay
                  label="Roti Type"
                  value={formData.dinner.roti.type}
                />
              )}
              {formData.dinner.vegetable && (
                <FieldDisplay
                  label="Vegetable"
                  value={formData.dinner.vegetable}
                />
              )}
              {formData.dinner.vegetableType && (
                <FieldDisplay
                  label="Vegetable Type"
                  value={formData.dinner.vegetableType}
                />
              )}
              {formData.dinner.vegetableCount && (
                <FieldDisplay
                  label="Vegetable Count"
                  value={`${formData.dinner.vegetableCount} bowls`}
                />
              )}
              {formData.dinner.dal?.bowls && (
                <FieldDisplay
                  label="Dal"
                  value={`${formData.dinner.dal.bowls} bowls`}
                />
              )}
              {formData.dinner.dal?.type && (
                <FieldDisplay
                  label="Dal Type"
                  value={formData.dinner.dal.type}
                />
              )}
              {formData.dinner.dal?.otherType && (
                <div className="md:col-span-2">
                  <FieldDisplay
                    label="Other Dal Type"
                    value={formData.dinner.dal.otherType}
                  />
                </div>
              )}
              {formData.dinner.sambhar?.bowls && (
                <FieldDisplay
                  label="Sambhar"
                  value={`${formData.dinner.sambhar.bowls} bowls`}
                />
              )}
              {formData.dinner.sambhar?.type && (
                <FieldDisplay
                  label="Sambhar Type"
                  value={formData.dinner.sambhar.type}
                />
              )}
              {formData.dinner.sambhar?.otherType && (
                <div className="md:col-span-2">
                  <FieldDisplay
                    label="Other Sambhar Type"
                    value={formData.dinner.sambhar.otherType}
                  />
                </div>
              )}
              {formData.dinner.curdKadhi?.bowls && (
                <FieldDisplay
                  label="Curd/Kadhi"
                  value={`${formData.dinner.curdKadhi.bowls} bowls`}
                />
              )}
              {formData.dinner.choleRajmaBeans?.bowls && (
                <FieldDisplay
                  label="Chole/Rajma/Beans"
                  value={`${formData.dinner.choleRajmaBeans.bowls} bowls`}
                />
              )}
              {formData.dinner.chicken?.checked && (
                <FieldDisplay
                  label="Chicken"
                  value={formData.dinner.chicken.quantity}
                />
              )}
              {formData.dinner.fish?.checked && (
                <FieldDisplay
                  label="Fish"
                  value={formData.dinner.fish.quantity}
                />
              )}
              {formData.dinner.mutton?.checked && (
                <FieldDisplay
                  label="Mutton"
                  value={formData.dinner.mutton.quantity}
                />
              )}
              {formData.dinner.seafood?.checked && (
                <FieldDisplay
                  label="Seafood"
                  value={formData.dinner.seafood.quantity}
                />
              )}
              {formData.dinner.pulao?.checked && (
                <FieldDisplay
                  label="Pulao"
                  value={`${formData.dinner.pulao.bowls} bowls`}
                />
              )}
              {formData.dinner.khichdi?.checked && (
                <FieldDisplay
                  label="Khichdi"
                  value={`${formData.dinner.khichdi.bowls} bowls`}
                />
              )}
              {formData.dinner.biryani?.checked && (
                <FieldDisplay
                  label="Biryani"
                  value={`${formData.dinner.biryani.bowls} bowls`}
                />
              )}
              {formData.dinner.salad !== undefined && (
                <div className="bg-white rounded p-2">
                  <div className="font-medium text-slate-900">
                    🥗 Salad:{" "}
                    {formData.dinner.salad?.checked ? "Yes" : "No"}
                  </div>
                  {formData.dinner.salad?.checked &&
                    formData.dinner.salad.type && (
                      <div className="text-sm text-slate-600">
                        Type: {formData.dinner.salad.type}
                      </div>
                    )}
                  {formData.dinner.salad?.checked &&
                    formData.dinner.salad.quantity && (
                      <div className="text-sm text-slate-600">
                        Quantity: {formData.dinner.salad.quantity}
                      </div>
                    )}
                </div>
              )}
              {formData.dinner.chutney !== undefined && (
                <div className="bg-white rounded p-2">
                  <div className="font-medium text-slate-900">
                    Chutney:{" "}
                    {formData.dinner.chutney?.checked ? "Yes" : "No"}
                  </div>
                  {formData.dinner.chutney?.checked &&
                    formData.dinner.chutney.type && (
                      <div className="text-sm text-slate-600">
                        Type: {formData.dinner.chutney.type}
                      </div>
                    )}
                </div>
              )}
              {formData.dinner.pickle !== undefined && (
                <div className="bg-white rounded p-2">
                  <div className="font-medium text-slate-900">
                    🥒 Pickle:{" "}
                    {formData.dinner.pickle?.checked ? "Yes" : "No"}
                  </div>
                </div>
              )}
              <div className="md:col-span-2">
                <FieldDisplay label="Other" value={formData.dinner.other} />
              </div>
              <div className="md:col-span-2">
                <FieldDisplay
                  label="Other Quantity"
                  value={formData.dinner.otherQuantity}
                />
              </div>
              {formData.dinner.sweets?.checked && (
                <FieldDisplay
                  label="Sweets"
                  value={`${formData.dinner.sweets.bowls} bowls`}
                />
              )}
              {formData.dinner.dessert?.checked && (
                <FieldDisplay
                  label="Dessert"
                  value={`${formData.dinner.dessert.bowls} bowls`}
                />
              )}
              {formData.dinner.laddu?.checked && (
                <FieldDisplay
                  label="Laddu"
                  value={`${formData.dinner.laddu.bowls} bowls`}
                />
              )}
              {formData.dinner.fruits?.checked && (
                <FieldDisplay
                  label="Fruits"
                  value={`${formData.dinner.fruits.bowls} bowls`}
                />
              )}
              {formData.dinner.midDayOther && (
                <div className="md:col-span-2">
                  <FieldDisplay
                    label="Other"
                    value={formData.dinner.midDayOther}
                  />
                </div>
              )}
              {formData.dinner.midDayOtherQuantity && (
                <div className="md:col-span-2">
                  <FieldDisplay
                    label="Other Quantity"
                    value={formData.dinner.midDayOtherQuantity}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(FoodRecallSection);
