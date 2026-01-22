"use client";

import React, { useMemo } from "react";
import { FieldDisplay } from "./shared-helpers";
import VirtualizedList from "../VirtualizedList";

interface FoodFrequencySectionProps {
  foodFrequency: any;
}

const FoodFrequencySection = ({ foodFrequency }: FoodFrequencySectionProps) => {
  if (!foodFrequency || Object.keys(foodFrequency).length === 0) {
    return null;
  }

  // Memoize derived lists to avoid recalculating on unrelated re-renders.
  const nonVegData = foodFrequency?.nonVeg;
  const nonVegComputed = useMemo(() => {
    if (!nonVegData) return { has: false, asArray: false, checked: [] as any[] };

    if (Array.isArray(nonVegData)) {
      const checked = nonVegData.filter((item: any) => item?.checked);
      return { has: checked.length > 0, asArray: true, checked };
    }

    const entries = Object.entries(nonVegData).filter(
      ([, item]: [string, any]) => item?.checked
    );
    return { has: entries.length > 0, asArray: false, checked: entries };
  }, [nonVegData]);

  const dairyData = foodFrequency?.dairy;
  const hasDairy = useMemo(
    () => !!dairyData && Object.keys(dairyData).length > 0,
    [dairyData]
  );

  const packagedData = foodFrequency?.packaged;
  const packagedComputed = useMemo(() => {
    if (!packagedData) return { has: false, asArray: false, items: [] as any[] };

    if (Array.isArray(packagedData)) {
      const items = packagedData.filter((item: any) => item?.checked);
      return { has: items.length > 0, asArray: true, items };
    }

    const configs = [
      "Noodles",
      "Butter/Cream/Ghee",
      "Ghee Chapati",
      "Cheese",
      "Ice Cream",
      "Milkshake",
      "Chocolate",
      "Fried Foods",
      "Pickle/Papad",
      "Lemon Sweets",
      "Biscuits",
      "Sweets/Desserts",
      "Jam/Sauces",
      "Instant Foods",
      "Soft Drinks",
    ].map((itemName) => {
      const key = itemName.toLowerCase().replace(/[\/ ]/g, "");
      const item = (packagedData as any)?.[key];
      const isChecked = item?.checked === true;
      return { key, itemName, item, isChecked };
    });

    // Keep "has" consistent with prior logic: object with any keys counts as present.
    const has = Object.keys(packagedData).length > 0;
    return { has, asArray: false, items: configs };
  }, [packagedData]);

  const sweetenersData = foodFrequency?.sweeteners;
  const sweetenersComputed = useMemo(() => {
    if (!sweetenersData)
      return { has: false, asArray: false, items: [] as any[] };

    if (Array.isArray(sweetenersData)) {
      const items = sweetenersData.filter((item: any) => item?.checked);
      return { has: items.length > 0, asArray: true, items };
    }

    const configs = ["Sugar", "Honey", "Jaggery"].map((itemName) => {
      const key = itemName.toLowerCase();
      const item = (sweetenersData as any)?.[key];
      const isChecked = item?.checked === true;
      return { key, itemName, item, isChecked };
    });

    const has = Object.keys(sweetenersData).length > 0;
    return { has, asArray: false, items: configs };
  }, [sweetenersData]);

  const drinksData = foodFrequency?.drinks;
  const drinksComputed = useMemo(() => {
    if (!drinksData) return { has: false, asArray: false, items: [] as any[] };

    if (Array.isArray(drinksData)) {
      const items = drinksData.filter((item: any) => item?.checked);
      return { has: items.length > 0, asArray: true, items };
    }

    const configs = ["Tea", "Coffee"].map((itemName) => {
      const key = itemName.toLowerCase();
      const item = (drinksData as any)?.[key];
      const isChecked = item?.checked === true;
      return { key, itemName, item, isChecked };
    });

    const has = Object.keys(drinksData).length > 0;
    return { has, asArray: false, items: configs };
  }, [drinksData]);

  const lifestyleData = foodFrequency?.lifestyle;
  const lifestyleComputed = useMemo(() => {
    if (!lifestyleData)
      return { has: false, asArray: false, arrayItems: [] as any[] };

    if (Array.isArray(lifestyleData)) {
      const arrayItems = lifestyleData.filter((item: any) => item?.checked);
      return {
        has: arrayItems.length > 0,
        asArray: true,
        arrayItems,
        smoking: null,
        tobacco: null,
        alcohol: null,
      };
    }

    const smoking = (lifestyleData as any)?.smoking;
    const tobacco = (lifestyleData as any)?.tobacco;
    const alcohol = (lifestyleData as any)?.alcohol;
    const has = Object.keys(lifestyleData).length > 0;
    return {
      has,
      asArray: false,
      arrayItems: [] as any[],
      smoking,
      tobacco,
      alcohol,
    };
  }, [lifestyleData]);

  const healthyFoodsData = foodFrequency?.healthyFoods;
  const healthyFoodsComputed = useMemo(() => {
    if (!healthyFoodsData)
      return { has: false, asArray: false, items: [] as any[] };

    if (Array.isArray(healthyFoodsData)) {
      const items = healthyFoodsData.filter((item: any) => item?.checked);
      return { has: items.length > 0, asArray: true, items };
    }

    const configs = [
      "Leafy Veg (Bowls)",
      "Fresh Fruits",
      "Dry Fruits & Nuts",
      "Veg Salad",
    ].map((itemName) => {
      const key = itemName.toLowerCase().replace(/[ &]/g, "");
      const item = (healthyFoodsData as any)?.[key];
      const isChecked = item?.checked === true;
      return { key, itemName, item, isChecked };
    });

    const has = Object.keys(healthyFoodsData).length > 0;
    return { has, asArray: false, items: configs };
  }, [healthyFoodsData]);

  return (
    <div className="mb-6 pb-6 border-b border-slate-200">
      <h4 className="text-lg font-semibold text-emerald-700 mb-4">
        Section 5 — Food Frequency
      </h4>
      <div className="space-y-4">
        {/* Non-Veg */}
        {nonVegComputed.has && (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200 shadow-sm mb-4">
              <h5 className="font-bold text-slate-800 mb-4 text-lg border-b-2 border-slate-300 pb-2">
                Non-Veg
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {nonVegComputed.asArray
                  ? (nonVegComputed.checked as any[]).map(
                      (item: any, idx: number) => (
                        <div key={idx} className="bg-white rounded p-3">
                          <div className="font-medium text-slate-900 mb-1">
                            {item.name}
                          </div>
                          {item.qtyPieces && (
                            <div className="text-sm text-slate-600">
                              Qty: {item.qtyPieces} pieces
                            </div>
                          )}
                          {item.prepType && (
                            <div className="text-sm text-slate-600">
                              Prep: {item.prepType}
                            </div>
                          )}
                          {item.frequency && (
                            <div className="text-sm text-slate-600">
                              Frequency: {item.frequency}
                            </div>
                          )}
                        </div>
                      )
                    )
                  : // Handle as object (legacy format)
                    (nonVegComputed.checked as [string, any][]).map(
                      ([key, item]: [string, any]) => {
                        if (!item?.checked) return null;
                        return (
                          <div key={key} className="bg-white rounded p-3">
                            <div className="font-medium text-slate-900 mb-1">
                              {key.charAt(0).toUpperCase() + key.slice(1)}
                            </div>
                            {item.qtyPieces && (
                              <div className="text-sm text-slate-600">
                                Qty: {item.qtyPieces} pieces
                              </div>
                            )}
                            {item.prepType && (
                              <div className="text-sm text-slate-600">
                                Prep: {item.prepType}
                              </div>
                            )}
                            {item.frequency && (
                              <div className="text-sm text-slate-600">
                                Frequency: {item.frequency}
                              </div>
                            )}
                          </div>
                        );
                      }
                    )}
              </div>
            </div>
          )}

        {/* Dairy */}
        {hasDairy && (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200 shadow-sm mb-4">
              <h5 className="font-bold text-slate-800 mb-4 text-lg border-b-2 border-slate-300 pb-2">
                Dairy
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(() => {
                  const milk = (dairyData as any).milk as any;
                  if (milk === undefined) return null;
                  return (
                    <div className="bg-white rounded p-2">
                      <div className="font-medium text-slate-900">
                        Milk: {milk?.checked ? "Yes" : "No"}
                      </div>
                      {milk?.checked && milk.glasses && (
                        <div className="text-sm text-slate-600">
                          Quantity: {milk.glasses} glasses
                        </div>
                      )}
                      {milk?.checked && milk.frequency && (
                        <div className="text-sm text-slate-600">
                          Frequency: {milk.frequency}
                        </div>
                      )}
                    </div>
                  );
                })()}
                {(dairyData as any).curdButtermilk && (
                  <FieldDisplay
                    label="Curd / Buttermilk"
                    value={(dairyData as any).curdButtermilk}
                  />
                )}
              </div>
            </div>
          )}

        {/* Packaged Items */}
        {packagedComputed.has && (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200 shadow-sm mb-4">
              <h5 className="font-bold text-slate-800 mb-4 text-lg border-b-2 border-slate-300 pb-2">
                Packaged / Daily Items
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {packagedComputed.asArray
                  ? (packagedComputed.items as any[]).map(
                      (item: any, idx: number) => (
                        <div key={idx} className="bg-white rounded p-3">
                          <div className="font-medium text-slate-900 mb-1">
                            {item.name}
                          </div>
                          {item.quantity && (
                            <div className="text-sm text-slate-600">
                              Qty: {item.quantity}
                            </div>
                          )}
                          {item.frequency && (
                            <div className="text-sm text-slate-600">
                              Frequency: {item.frequency}
                            </div>
                          )}
                        </div>
                      )
                    )
                  : // Handle as object (current format)
                    (packagedComputed.items as any[]).map(
                      ({ key, itemName, item, isChecked }: any) => (
                        <div key={key} className="bg-white rounded p-3">
                          <div className="font-medium text-slate-900 mb-1">
                            {itemName}: {isChecked ? "Yes" : "No"}
                          </div>
                          {isChecked && item.quantity && (
                            <div className="text-sm text-slate-600">
                              Qty: {item.quantity}
                            </div>
                          )}
                          {isChecked && item.frequency && (
                            <div className="text-sm text-slate-600">
                              Frequency: {item.frequency}
                            </div>
                          )}
                        </div>
                      )
                    )}
              </div>
            </div>
          )}

        {/* Sweeteners */}
        {sweetenersComputed.has && (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200 shadow-sm mb-4">
              <h5 className="font-bold text-slate-800 mb-4 text-lg border-b-2 border-slate-300 pb-2">
                Sweeteners
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {sweetenersComputed.asArray
                  ? (sweetenersComputed.items as any[]).map(
                      (item: any, idx: number) => (
                        <div key={idx} className="bg-white rounded p-3">
                          <div className="font-medium text-slate-900 mb-1">
                            {item.name}
                          </div>
                          {item.qty && (
                            <div className="text-sm text-slate-600">
                              Qty: {item.qty} TSP/TBSP
                            </div>
                          )}
                          {item.frequency && (
                            <div className="text-sm text-slate-600">
                              Frequency: {item.frequency}
                            </div>
                          )}
                        </div>
                      )
                    )
                  : // Handle as object (current format)
                    (sweetenersComputed.items as any[]).map(
                      ({ key, itemName, item, isChecked }: any) => (
                        <div key={key} className="bg-white rounded p-3">
                          <div className="font-medium text-slate-900 mb-1">
                            {itemName}: {isChecked ? "Yes" : "No"}
                          </div>
                          {isChecked && item.qty && (
                            <div className="text-sm text-slate-600">
                              Qty: {item.qty} TSP/TBSP
                            </div>
                          )}
                          {isChecked && item.frequency && (
                            <div className="text-sm text-slate-600">
                              Frequency: {item.frequency}
                            </div>
                          )}
                        </div>
                      )
                    )}
              </div>
            </div>
          )}

        {/* Drinks */}
        {drinksComputed.has && (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200 shadow-sm mb-4">
              <h5 className="font-bold text-slate-800 mb-4 text-lg border-b-2 border-slate-300 pb-2">
                Drinks
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {drinksComputed.asArray
                  ? (drinksComputed.items as any[]).map(
                      (item: any, idx: number) => (
                        <div key={idx} className="bg-white rounded p-3">
                          <div className="font-medium text-slate-900 mb-1">
                            {item.name}
                          </div>
                          {item.qty && (
                            <div className="text-sm text-slate-600">
                              Qty: {item.qty} cups/pieces
                            </div>
                          )}
                          {item.frequency && (
                            <div className="text-sm text-slate-600">
                              Frequency: {item.frequency}
                            </div>
                          )}
                        </div>
                      )
                    )
                  : // Handle as object (current format)
                    (drinksComputed.items as any[]).map(
                      ({ key, itemName, item, isChecked }: any) => (
                        <div key={key} className="bg-white rounded p-3">
                          <div className="font-medium text-slate-900 mb-1">
                            {itemName}: {isChecked ? "Yes" : "No"}
                          </div>
                          {isChecked && item.qty && (
                            <div className="text-sm text-slate-600">
                              Qty: {item.qty} cups/pieces
                            </div>
                          )}
                          {isChecked && item.frequency && (
                            <div className="text-sm text-slate-600">
                              Frequency: {item.frequency}
                            </div>
                          )}
                        </div>
                      )
                    )}
              </div>
            </div>
          )}

        {/* Lifestyle */}
        {lifestyleComputed.has && (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200 shadow-sm mb-4">
              <h5 className="font-bold text-slate-800 mb-4 text-lg border-b-2 border-slate-300 pb-2">
                Lifestyle
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {lifestyleComputed.asArray ? (
                  // Handle as array
                  (lifestyleComputed.arrayItems as any[]).map(
                    (item: any, idx: number) => (
                      <div key={idx} className="bg-white rounded p-3">
                        <div className="font-medium text-slate-900 mb-1">
                          {item.name}: Yes
                        </div>
                        {item.qty && (
                          <div className="text-sm text-slate-600">
                            Qty: {item.qty}
                          </div>
                        )}
                        {item.frequency && (
                          <div className="text-sm text-slate-600">
                            Frequency: {item.frequency}
                          </div>
                        )}
                      </div>
                    )
                  )
                ) : (
                  // Handle as object (current format)
                  <>
                    {(["Smoking", "Tobacco"] as const).map((itemName) => {
                      const key = itemName.toLowerCase();
                      const item =
                        key === "smoking"
                          ? (lifestyleComputed as any).smoking
                          : (lifestyleComputed as any).tobacco;
                      const isChecked = item?.checked === true;
                      return (
                        <div key={key} className="bg-white rounded p-3">
                          <div className="font-medium text-slate-900 mb-1">
                            {itemName}: {isChecked ? "Yes" : "No"}
                          </div>
                          {isChecked && item.qty && (
                            <div className="text-sm text-slate-600">
                              Qty: {item.qty} cups/pieces
                            </div>
                          )}
                          {isChecked && item.frequency && (
                            <div className="text-sm text-slate-600">
                              Frequency: {item.frequency}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {(() => {
                      const alcohol = (lifestyleComputed as any).alcohol;
                      const isChecked = alcohol?.checked === true;
                      return (
                        <div className="bg-white rounded p-3">
                          <div className="font-medium text-slate-900 mb-1">
                            Alcohol: {isChecked ? "Yes" : "No"}
                          </div>
                          {isChecked && alcohol.qty && (
                            <div className="text-sm text-slate-600">
                              Qty: {alcohol.qty} ml
                            </div>
                          )}
                          {isChecked && alcohol.frequency && (
                            <div className="text-sm text-slate-600">
                              Frequency: {alcohol.frequency}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>
          )}

        {/* Water */}
        {foodFrequency.water !== undefined && (
          <div className="bg-slate-50 rounded-lg p-4">
            <h5 className="font-semibold text-slate-700 mb-3">Water</h5>
            <div className="bg-white rounded p-3">
              <div className="font-medium text-slate-900 mb-1">
                Water: {foodFrequency.water?.checked ? "Yes" : "No"}
              </div>
              {foodFrequency.water?.checked &&
                foodFrequency.water.qty && (
                  <div className="text-sm text-slate-600">
                    Qty: {foodFrequency.water.qty} cups/pieces
                  </div>
                )}
              {foodFrequency.water?.checked &&
                foodFrequency.water.frequency && (
                  <div className="text-sm text-slate-600">
                    Frequency: {foodFrequency.water.frequency}
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Healthy Foods */}
        {healthyFoodsComputed.has && (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200 shadow-sm mb-4">
              <h5 className="font-bold text-slate-800 mb-4 text-lg border-b-2 border-slate-300 pb-2">
                Healthy Foods
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {healthyFoodsComputed.asArray
                  ? // Handle as array (legacy format)
                    (healthyFoodsComputed.items as any[]).map(
                      (item: any, idx: number) => (
                        <div key={idx} className="bg-white rounded p-3">
                          <div className="font-medium text-slate-900 mb-1">
                            {item.name}
                          </div>
                          {item.qty && (
                            <div className="text-sm text-slate-600">
                              Qty: {item.qty} cups/pieces
                            </div>
                          )}
                          {item.frequency && (
                            <div className="text-sm text-slate-600">
                              Frequency: {item.frequency}
                            </div>
                          )}
                        </div>
                      )
                    )
                  : // Handle as object (current format)
                    (healthyFoodsComputed.items as any[]).map(
                      ({ key, itemName, item, isChecked }: any) => (
                        <div key={key} className="bg-white rounded p-3">
                          <div className="font-medium text-slate-900 mb-1">
                            {itemName}: {isChecked ? "Yes" : "No"}
                          </div>
                          {isChecked && item.qty && (
                            <div className="text-sm text-slate-600">
                              Qty: {item.qty} cups/pieces
                            </div>
                          )}
                          {isChecked && item.frequency && (
                            <div className="text-sm text-slate-600">
                              Frequency: {item.frequency}
                            </div>
                          )}
                        </div>
                      )
                    )}
              </div>
            </div>
          )}

        {/* Eating Out */}
        {foodFrequency.eatingOut !== undefined && (
          <div className="bg-slate-50 rounded-lg p-4">
            <h5 className="font-semibold text-slate-700 mb-3">Eating Out</h5>
            <div className="bg-white rounded p-3">
              <div className="font-medium text-slate-900 mb-1">
                Eating Out:{" "}
                {foodFrequency.eatingOut?.checked ? "Yes" : "No"}
              </div>
              {foodFrequency.eatingOut?.checked &&
                foodFrequency.eatingOut.frequency && (
                  <div className="text-sm text-slate-600 mb-2">
                    Frequency: {foodFrequency.eatingOut.frequency}
                  </div>
                )}
              {foodFrequency.eatingOut?.checked &&
                foodFrequency.eatingOut.foodItems && (
                  <div className="text-sm text-slate-600">
                    Food Items: {foodFrequency.eatingOut.foodItems}
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Coconut */}
        {foodFrequency.coconut !== undefined && (
          <div className="bg-slate-50 rounded-lg p-4">
            <h5 className="font-semibold text-slate-700 mb-3">Coconut</h5>
            <div className="bg-white rounded p-3">
              <div className="font-medium text-slate-900 mb-1">
                Coconut: {foodFrequency.coconut?.checked ? "Yes" : "No"}
              </div>
              {foodFrequency.coconut?.checked &&
                foodFrequency.coconut.frequency && (
                  <div className="text-sm text-slate-600">
                    Frequency: {foodFrequency.coconut.frequency}
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Pizza/Burger */}
        {foodFrequency.pizzaBurger !== undefined && (
          <div className="bg-slate-50 rounded-lg p-4">
            <h5 className="font-semibold text-slate-700 mb-3">Pizza/Burger</h5>
            <div className="bg-white rounded p-3">
              <div className="font-medium text-slate-900 mb-1">
                Pizza/Burger:{" "}
                {foodFrequency.pizzaBurger?.checked ? "Yes" : "No"}
              </div>
              {foodFrequency.pizzaBurger?.checked &&
                foodFrequency.pizzaBurger.qty && (
                  <div className="text-sm text-slate-600 mb-2">
                    Qty: {foodFrequency.pizzaBurger.qty} cups/pieces
                  </div>
                )}
              {foodFrequency.pizzaBurger?.checked &&
                foodFrequency.pizzaBurger.frequency && (
                  <div className="text-sm text-slate-600">
                    Frequency: {foodFrequency.pizzaBurger.frequency}
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Oil / Fat */}
        {foodFrequency.oilFat &&
          Object.keys(foodFrequency.oilFat).length > 0 && (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200 shadow-sm mb-4">
              <h5 className="font-bold text-slate-800 mb-4 text-lg border-b-2 border-slate-300 pb-2">
                Oil / Fat
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FieldDisplay
                  label="Type of Oil"
                  value={foodFrequency.oilFat.typeOfOil}
                />
                <FieldDisplay
                  label="Oil Per Month"
                  value={foodFrequency.oilFat.oilPerMonth}
                />
                <div className="md:col-span-2">
                  <FieldDisplay
                    label="Total Members in House"
                    value={foodFrequency.oilFat.totalMembersInHouse}
                  />
                </div>
                <div className="md:col-span-2">
                  <FieldDisplay
                    label="Reuse Fried Oil in Cooking?"
                    value={foodFrequency.oilFat.reuseFriedOil}
                  />
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default React.memo(FoodFrequencySection);
