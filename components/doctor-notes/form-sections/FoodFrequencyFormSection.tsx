"use client";

import React from "react";
import {
  Input,
  TextArea,
  Radio,
  Select,
  Checkbox,
  CheckboxWithText,
  FoodQty,
  Qty5Select,
  SubSection,
} from "./FormUIComponents";

interface FoodFrequencyFormSectionProps {
  formData: any;
  updateFormData: (path: string[], value: any) => void;
  getFormValue: (path: string[]) => any;
}

export default function FoodFrequencyFormSection({
  formData,
  updateFormData,
  getFormValue,
}: FoodFrequencyFormSectionProps) {
  const foodFrequency = getFormValue(["foodFrequency"]) || {};
  return (
    <div className="space-y-6">
      <SubSection title="Non-Veg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          {["Fish", "White Meat", "Mutton", "Sea Fish"].map((item) => (
            <div
              key={item}
              className="space-y-4 p-4 bg-white/50 rounded-lg border border-emerald-200"
            >
              <Checkbox
                label={item}
                checked={
                  foodFrequency.nonVeg?.[item.toLowerCase().replace(/ /g, "")]
                    ?.checked || false
                }
                onChange={(checked) => {
                  const nonVeg = foodFrequency.nonVeg || {};
                  updateFormData(
                    [
                      "foodFrequency",
                      "nonVeg",
                      item.toLowerCase().replace(/ /g, ""),
                    ],
                    { ...nonVeg[item.toLowerCase().replace(/ /g, "")], checked }
                  );
                }}
              />
              <Qty5Select
                label={`${item} Qty (Pieces)`}
                value={
                  foodFrequency.nonVeg?.[item.toLowerCase().replace(/ /g, "")]
                    ?.qtyPieces || ""
                }
                onValueChange={(val) => {
                  const nonVeg = foodFrequency.nonVeg || {};
                  updateFormData(
                    [
                      "foodFrequency",
                      "nonVeg",
                      item.toLowerCase().replace(/ /g, ""),
                    ],
                    {
                      ...nonVeg[item.toLowerCase().replace(/ /g, "")],
                      qtyPieces: val,
                    }
                  );
                }}
              />
              <Select
                label="Type of Preparation"
                options={["Dry Form", "Curry Form"]}
                value={
                  foodFrequency.nonVeg?.[item.toLowerCase().replace(/ /g, "")]
                    ?.prepType || ""
                }
                onChange={(val) => {
                  const nonVeg = foodFrequency.nonVeg || {};
                  updateFormData(
                    [
                      "foodFrequency",
                      "nonVeg",
                      item.toLowerCase().replace(/ /g, ""),
                    ],
                    {
                      ...nonVeg[item.toLowerCase().replace(/ /g, "")],
                      prepType: val,
                    }
                  );
                }}
              />
              <Select
                label="Frequency"
                options={["Daily", "Weekly", "Monthly"]}
                value={
                  foodFrequency.nonVeg?.[item.toLowerCase().replace(/ /g, "")]
                    ?.frequency || ""
                }
                onChange={(val) => {
                  const nonVeg = foodFrequency.nonVeg || {};
                  updateFormData(
                    [
                      "foodFrequency",
                      "nonVeg",
                      item.toLowerCase().replace(/ /g, ""),
                    ],
                    {
                      ...nonVeg[item.toLowerCase().replace(/ /g, "")],
                      frequency: val,
                    }
                  );
                }}
              />
            </div>
          ))}
          <div className="md:col-span-2">
            <div className="space-y-4 p-4 bg-white/50 rounded-lg border border-emerald-200">
              <Checkbox
                label="Egg"
                checked={foodFrequency.nonVeg?.egg?.checked || false}
                onChange={(checked) =>
                  updateFormData(["foodFrequency", "nonVeg", "egg"], {
                    ...foodFrequency.nonVeg?.egg,
                    checked,
                  })
                }
              />
              <Select
                label="Type of Preparation"
                options={["Boiled", "Burnt", "Omelette", "Poach"]}
                value={foodFrequency.nonVeg?.egg?.prepType || ""}
                onChange={(val) =>
                  updateFormData(["foodFrequency", "nonVeg", "egg"], {
                    ...foodFrequency.nonVeg?.egg,
                    prepType: val,
                  })
                }
              />
              <Select
                label="Frequency"
                options={["Daily", "Weekly", "Monthly"]}
                value={foodFrequency.nonVeg?.egg?.frequency || ""}
                onChange={(val) =>
                  updateFormData(["foodFrequency", "nonVeg", "egg"], {
                    ...foodFrequency.nonVeg?.egg,
                    frequency: val,
                  })
                }
              />
            </div>
          </div>
        </div>
      </SubSection>

      <SubSection title="Dairy">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          <div className="space-y-4 p-4 bg-white/50 rounded-lg border border-emerald-200">
            <Qty5Select
              label="Milk (Glass)"
              checkbox
              checked={foodFrequency.dairy?.milk?.checked || false}
              value={foodFrequency.dairy?.milk?.glasses || ""}
              onCheckedChange={(checked) =>
                updateFormData(["foodFrequency", "dairy", "milk"], {
                  ...foodFrequency.dairy?.milk,
                  checked,
                })
              }
              onValueChange={(val) =>
                updateFormData(["foodFrequency", "dairy", "milk"], {
                  ...foodFrequency.dairy?.milk,
                  glasses: val,
                })
              }
            />
            <Select
              label="Frequency"
              options={["Daily", "Weekly", "Monthly"]}
              value={foodFrequency.dairy?.milk?.frequency || ""}
              onChange={(val) =>
                updateFormData(["foodFrequency", "dairy", "milk"], {
                  ...foodFrequency.dairy?.milk,
                  frequency: val,
                })
              }
            />
          </div>
          <Radio
            label="Curd / Buttermilk"
            options={["Daily", "Weekly", "Monthly"]}
            value={foodFrequency.dairy?.curdButtermilk || ""}
            onChange={(val) =>
              updateFormData(["foodFrequency", "dairy", "curdButtermilk"], val)
            }
          />
        </div>
      </SubSection>

      <SubSection title="Packaged / Daily Items">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {[
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
          ].map((item) => (
            <div key={item} className="space-y-3">
              <Checkbox
                label={item}
                checked={
                  foodFrequency.packaged?.[
                    item.toLowerCase().replace(/[\/ ]/g, "")
                  ]?.checked || false
                }
                onChange={(checked) => {
                  const packaged = foodFrequency.packaged || {};
                  updateFormData(
                    [
                      "foodFrequency",
                      "packaged",
                      item.toLowerCase().replace(/[\/ ]/g, ""),
                    ],
                    {
                      ...packaged[item.toLowerCase().replace(/[\/ ]/g, "")],
                      checked,
                    }
                  );
                }}
              />
              <TextArea
                label="Quantity"
                value={
                  foodFrequency.packaged?.[
                    item.toLowerCase().replace(/[\/ ]/g, "")
                  ]?.quantity || ""
                }
                onChange={(val) => {
                  const packaged = foodFrequency.packaged || {};
                  updateFormData(
                    [
                      "foodFrequency",
                      "packaged",
                      item.toLowerCase().replace(/[\/ ]/g, ""),
                    ],
                    {
                      ...packaged[item.toLowerCase().replace(/[\/ ]/g, "")],
                      quantity: val,
                    }
                  );
                }}
                small
              />
              <Select
                label="Frequency"
                options={["Daily", "Weekly", "Monthly"]}
                value={
                  foodFrequency.packaged?.[
                    item.toLowerCase().replace(/[\/ ]/g, "")
                  ]?.frequency || ""
                }
                onChange={(val) => {
                  const packaged = foodFrequency.packaged || {};
                  updateFormData(
                    [
                      "foodFrequency",
                      "packaged",
                      item.toLowerCase().replace(/[\/ ]/g, ""),
                    ],
                    {
                      ...packaged[item.toLowerCase().replace(/[\/ ]/g, "")],
                      frequency: val,
                    }
                  );
                }}
              />
            </div>
          ))}
        </div>
      </SubSection>

      <SubSection title="Sweeteners">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {["Sugar", "Honey", "Jaggery"].map((item) => (
            <div key={item} className="space-y-3">
              <Checkbox
                label={item}
                checked={
                  foodFrequency.sweeteners?.[item.toLowerCase()]?.checked ||
                  false
                }
                onChange={(checked) => {
                  const sweeteners = foodFrequency.sweeteners || {};
                  updateFormData(
                    ["foodFrequency", "sweeteners", item.toLowerCase()],
                    { ...sweeteners[item.toLowerCase()], checked }
                  );
                }}
              />
              <Select
                label="Qty (TSP/TBSP)"
                options={["1", "2", "3", "4", "5", "6", "8", "9", "10"]}
                value={
                  foodFrequency.sweeteners?.[item.toLowerCase()]?.qty || ""
                }
                onChange={(val) => {
                  const sweeteners = foodFrequency.sweeteners || {};
                  updateFormData(
                    ["foodFrequency", "sweeteners", item.toLowerCase()],
                    { ...sweeteners[item.toLowerCase()], qty: val }
                  );
                }}
              />
              <Select
                label="Frequency"
                options={["Daily", "Weekly", "Monthly"]}
                value={
                  foodFrequency.sweeteners?.[item.toLowerCase()]?.frequency ||
                  ""
                }
                onChange={(val) => {
                  const sweeteners = foodFrequency.sweeteners || {};
                  updateFormData(
                    ["foodFrequency", "sweeteners", item.toLowerCase()],
                    { ...sweeteners[item.toLowerCase()], frequency: val }
                  );
                }}
              />
            </div>
          ))}
        </div>
      </SubSection>

      <SubSection title="Drinks">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          {["Tea", "Coffee"].map((item) => (
            <div key={item} className="space-y-3">
              <Checkbox
                label={item}
                checked={
                  foodFrequency.drinks?.[item.toLowerCase()]?.checked || false
                }
                onChange={(checked) => {
                  const drinks = foodFrequency.drinks || {};
                  updateFormData(
                    ["foodFrequency", "drinks", item.toLowerCase()],
                    { ...drinks[item.toLowerCase()], checked }
                  );
                }}
              />
              <Select
                label="Qty (cups/pieces)"
                options={["1", "2", "3", "4", "5", "6", "8", "9", "10"]}
                value={foodFrequency.drinks?.[item.toLowerCase()]?.qty || ""}
                onChange={(val) => {
                  const drinks = foodFrequency.drinks || {};
                  updateFormData(
                    ["foodFrequency", "drinks", item.toLowerCase()],
                    { ...drinks[item.toLowerCase()], qty: val }
                  );
                }}
              />
              <Select
                label="Frequency"
                options={["Daily", "Weekly", "Monthly"]}
                value={
                  foodFrequency.drinks?.[item.toLowerCase()]?.frequency || ""
                }
                onChange={(val) => {
                  const drinks = foodFrequency.drinks || {};
                  updateFormData(
                    ["foodFrequency", "drinks", item.toLowerCase()],
                    { ...drinks[item.toLowerCase()], frequency: val }
                  );
                }}
              />
            </div>
          ))}
        </div>
      </SubSection>

      <SubSection title="Lifestyle">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {["Smoking", "Tobacco"].map((item) => (
            <div key={item} className="space-y-3">
              <Checkbox
                label={item}
                checked={
                  foodFrequency.lifestyle?.[item.toLowerCase()]?.checked ||
                  false
                }
                onChange={(checked) => {
                  const lifestyle = foodFrequency.lifestyle || {};
                  updateFormData(
                    ["foodFrequency", "lifestyle", item.toLowerCase()],
                    { ...lifestyle[item.toLowerCase()], checked }
                  );
                }}
              />
              <Select
                label="Qty (cups/pieces)"
                options={["1", "2", "3", "4", "5", "6", "8", "9", "10"]}
                value={foodFrequency.lifestyle?.[item.toLowerCase()]?.qty || ""}
                onChange={(val) => {
                  const lifestyle = foodFrequency.lifestyle || {};
                  updateFormData(
                    ["foodFrequency", "lifestyle", item.toLowerCase()],
                    { ...lifestyle[item.toLowerCase()], qty: val }
                  );
                }}
              />
              <Select
                label="Frequency"
                options={["Daily", "Weekly", "Monthly"]}
                value={
                  foodFrequency.lifestyle?.[item.toLowerCase()]?.frequency || ""
                }
                onChange={(val) => {
                  const lifestyle = foodFrequency.lifestyle || {};
                  updateFormData(
                    ["foodFrequency", "lifestyle", item.toLowerCase()],
                    { ...lifestyle[item.toLowerCase()], frequency: val }
                  );
                }}
              />
            </div>
          ))}
          <div className="space-y-3">
            <Checkbox
              label="Alcohol"
              checked={foodFrequency.lifestyle?.alcohol?.checked || false}
              onChange={(checked) =>
                updateFormData(["foodFrequency", "lifestyle", "alcohol"], {
                  ...foodFrequency.lifestyle?.alcohol,
                  checked,
                })
              }
            />
            <TextArea
              label="Quantity (ml)"
              value={foodFrequency.lifestyle?.alcohol?.qty || ""}
              onChange={(val) =>
                updateFormData(["foodFrequency", "lifestyle", "alcohol"], {
                  ...foodFrequency.lifestyle?.alcohol,
                  qty: val,
                })
              }
              small
            />
            <Select
              label="Frequency"
              options={["Daily", "Weekly", "Monthly"]}
              value={foodFrequency.lifestyle?.alcohol?.frequency || ""}
              onChange={(val) =>
                updateFormData(["foodFrequency", "lifestyle", "alcohol"], {
                  ...foodFrequency.lifestyle?.alcohol,
                  frequency: val,
                })
              }
            />
          </div>
        </div>
      </SubSection>

      <SubSection title="Water">
        <div className="space-y-3">
          <Checkbox
            label="Water"
            checked={foodFrequency.water?.checked || false}
            onChange={(checked) =>
              updateFormData(["foodFrequency", "water"], {
                ...foodFrequency.water,
                checked,
              })
            }
          />
          <Select
            label="Qty (cups/pieces)"
            options={["1", "2", "3", "4", "5", "6", "8", "9", "10"]}
            value={foodFrequency.water?.qty || ""}
            onChange={(val) =>
              updateFormData(["foodFrequency", "water"], {
                ...foodFrequency.water,
                qty: val,
              })
            }
          />
          <Select
            label="Frequency"
            options={["Daily", "Weekly", "Monthly"]}
            value={foodFrequency.water?.frequency || ""}
            onChange={(val) =>
              updateFormData(["foodFrequency", "water"], {
                ...foodFrequency.water,
                frequency: val,
              })
            }
          />
        </div>
      </SubSection>

      <SubSection title="Healthy Foods">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {[
            "Leafy Veg (Bowls)",
            "Fresh Fruits",
            "Dry Fruits & Nuts",
            "Veg Salad",
          ].map((item) => (
            <div key={item} className="space-y-3">
              <Checkbox
                label={item}
                checked={
                  foodFrequency.healthyFoods?.[
                    item.toLowerCase().replace(/[ &]/g, "")
                  ]?.checked || false
                }
                onChange={(checked) => {
                  const healthyFoods = foodFrequency.healthyFoods || {};
                  updateFormData(
                    [
                      "foodFrequency",
                      "healthyFoods",
                      item.toLowerCase().replace(/[ &]/g, ""),
                    ],
                    {
                      ...healthyFoods[item.toLowerCase().replace(/[ &]/g, "")],
                      checked,
                    }
                  );
                }}
              />
              <Select
                label="Qty (cups/pieces)"
                options={["1", "2", "3", "4", "5", "6", "8", "9", "10"]}
                value={
                  foodFrequency.healthyFoods?.[
                    item.toLowerCase().replace(/[ &]/g, "")
                  ]?.qty || ""
                }
                onChange={(val) => {
                  const healthyFoods = foodFrequency.healthyFoods || {};
                  updateFormData(
                    [
                      "foodFrequency",
                      "healthyFoods",
                      item.toLowerCase().replace(/[ &]/g, ""),
                    ],
                    {
                      ...healthyFoods[item.toLowerCase().replace(/[ &]/g, "")],
                      qty: val,
                    }
                  );
                }}
              />
              <Select
                label="Frequency"
                options={["Daily", "Weekly", "Monthly"]}
                value={
                  foodFrequency.healthyFoods?.[
                    item.toLowerCase().replace(/[ &]/g, "")
                  ]?.frequency || ""
                }
                onChange={(val) => {
                  const healthyFoods = foodFrequency.healthyFoods || {};
                  updateFormData(
                    [
                      "foodFrequency",
                      "healthyFoods",
                      item.toLowerCase().replace(/[ &]/g, ""),
                    ],
                    {
                      ...healthyFoods[item.toLowerCase().replace(/[ &]/g, "")],
                      frequency: val,
                    }
                  );
                }}
              />
            </div>
          ))}
        </div>
      </SubSection>

      <SubSection title="Eating Out">
        <div className="space-y-4">
          <div className="space-y-3">
            <Checkbox
              label="Eating Out"
              checked={foodFrequency.eatingOut?.checked || false}
              onChange={(checked) =>
                updateFormData(["foodFrequency", "eatingOut"], {
                  ...foodFrequency.eatingOut,
                  checked,
                })
              }
            />
            <Select
              label="Frequency"
              options={["Daily", "Weekly", "Monthly"]}
              value={foodFrequency.eatingOut?.frequency || ""}
              onChange={(val) =>
                updateFormData(["foodFrequency", "eatingOut"], {
                  ...foodFrequency.eatingOut,
                  frequency: val,
                })
              }
            />
          </div>
          <TextArea
            label="Food Items Eaten Outside"
            value={foodFrequency.eatingOut?.foodItems || ""}
            onChange={(val) =>
              updateFormData(["foodFrequency", "eatingOut"], {
                ...foodFrequency.eatingOut,
                foodItems: val,
              })
            }
          />
        </div>
      </SubSection>

      <SubSection title="Coconut">
        <div className="space-y-3">
          <Checkbox
            label="Coconut (Dry / Fresh)"
            checked={foodFrequency.coconut?.checked || false}
            onChange={(checked) =>
              updateFormData(["foodFrequency", "coconut"], {
                ...foodFrequency.coconut,
                checked,
              })
            }
          />
          <Select
            label="Frequency"
            options={["Daily", "Weekly", "Monthly"]}
            value={foodFrequency.coconut?.frequency || ""}
            onChange={(val) =>
              updateFormData(["foodFrequency", "coconut"], {
                ...foodFrequency.coconut,
                frequency: val,
              })
            }
          />
        </div>
      </SubSection>

      <SubSection title="Pizza/Burger">
        <div className="space-y-3">
          <Checkbox
            label="Pizza/Burger"
            checked={foodFrequency.pizzaBurger?.checked || false}
            onChange={(checked) =>
              updateFormData(["foodFrequency", "pizzaBurger"], {
                ...foodFrequency.pizzaBurger,
                checked,
              })
            }
          />
          <Select
            label="Qty (cups/pieces)"
            options={["1", "2", "3", "4", "5", "6", "8", "9", "10"]}
            value={foodFrequency.pizzaBurger?.qty || ""}
            onChange={(val) =>
              updateFormData(["foodFrequency", "pizzaBurger"], {
                ...foodFrequency.pizzaBurger,
                qty: val,
              })
            }
          />
          <Select
            label="Frequency"
            options={["Daily", "Weekly", "Monthly"]}
            value={foodFrequency.pizzaBurger?.frequency || ""}
            onChange={(val) =>
              updateFormData(["foodFrequency", "pizzaBurger"], {
                ...foodFrequency.pizzaBurger,
                frequency: val,
              })
            }
          />
        </div>
      </SubSection>

      <SubSection title="Oil / Fat">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          <Select
            label="Type of Oil"
            options={["Sunflower", "Soyabean", "Vegetable Oil", "Rice Bran"]}
            value={foodFrequency.oilFat?.typeOfOil || ""}
            onChange={(val) =>
              updateFormData(["foodFrequency", "oilFat"], {
                ...foodFrequency.oilFat,
                typeOfOil: val,
              })
            }
          />
          <Select
            label="Oil Per Month"
            options={["1L", "2L", "3L", "4L", "5L"]}
            value={foodFrequency.oilFat?.oilPerMonth || ""}
            onChange={(val) =>
              updateFormData(["foodFrequency", "oilFat"], {
                ...foodFrequency.oilFat,
                oilPerMonth: val,
              })
            }
          />
          <div className="md:col-span-2">
            <TextArea
              label="Total Members in House"
              value={foodFrequency.oilFat?.totalMembersInHouse || ""}
              onChange={(val) =>
                updateFormData(["foodFrequency", "oilFat"], {
                  ...foodFrequency.oilFat,
                  totalMembersInHouse: val,
                })
              }
              small
            />
          </div>
          <div className="md:col-span-2">
            <Radio
              label="Reuse Fried Oil in Cooking?"
              options={["Yes", "No"]}
              value={foodFrequency.oilFat?.reuseFriedOil || ""}
              onChange={(val) =>
                updateFormData(["foodFrequency", "oilFat"], {
                  ...foodFrequency.oilFat,
                  reuseFriedOil: val,
                })
              }
            />
          </div>
        </div>
      </SubSection>
    </div>
  );
}
