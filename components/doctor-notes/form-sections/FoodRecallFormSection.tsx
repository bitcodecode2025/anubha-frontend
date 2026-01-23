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

interface FoodRecallFormSectionProps {
  formData: any;
  updateFormData: (path: string[], value: any) => void;
  getFormValue: (path: string[]) => any;
}

export default function FoodRecallFormSection({
  formData,
  updateFormData,
  getFormValue,
}: FoodRecallFormSectionProps) {
  const morningIntake = getFormValue(["morningIntake"]) || {};
  const breakfast = getFormValue(["breakfast"]) || {};
  const midMorning = getFormValue(["midMorning"]) || {};
  const lunch = getFormValue(["lunch"]) || {};
  const midDay = getFormValue(["midDay"]) || {};
  const eveningSnack = getFormValue(["eveningSnack"]) || {};
  const dinner = getFormValue(["dinner"]) || {};

  return (
    <div className="space-y-6">
      {/* Morning Intake */}
      <SubSection title="Morning Intake">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          <TextArea
            label="Time"
            value={morningIntake.time || ""}
            onChange={(val) => updateFormData(["morningIntake", "time"], val)}
            isTime
          />
          <Input
            label="Water Intake (Number)"
            type="number"
            value={morningIntake.waterIntake || ""}
            onChange={(val) =>
              updateFormData(
                ["morningIntake", "waterIntake"],
                val ? parseInt(val) : undefined
              )
            }
          />
          <div className="sm:col-span-2">
            <TextArea
              label="Any Medicines"
              value={morningIntake.medicines || ""}
              onChange={(val) =>
                updateFormData(["morningIntake", "medicines"], val)
              }
            />
          </div>
          <CheckboxWithText
            label="Tea"
            subLabel="Tea Type"
            checked={morningIntake.tea?.checked || false}
            textValue={morningIntake.tea?.type || ""}
            onCheckedChange={(checked) =>
              updateFormData(["morningIntake", "tea"], {
                ...morningIntake.tea,
                checked,
              })
            }
            onTextChange={(text) =>
              updateFormData(["morningIntake", "tea"], {
                ...morningIntake.tea,
                type: text,
              })
            }
          />
          <Checkbox
            label="Coffee"
            checked={morningIntake.coffee?.checked || false}
            onChange={(checked) =>
              updateFormData(["morningIntake", "coffee"], { checked })
            }
          />
          <Checkbox
            label="Lemon Water"
            checked={morningIntake.lemonWater?.checked || false}
            onChange={(checked) =>
              updateFormData(["morningIntake", "lemonWater"], { checked })
            }
          />
          <CheckboxWithText
            label="Garlic & Other Herbs"
            subLabel="Types"
            checked={morningIntake.garlicHerbs?.checked || false}
            textValue={morningIntake.garlicHerbs?.types || ""}
            onCheckedChange={(checked) =>
              updateFormData(["morningIntake", "garlicHerbs"], {
                ...morningIntake.garlicHerbs,
                checked,
              })
            }
            onTextChange={(text) =>
              updateFormData(["morningIntake", "garlicHerbs"], {
                ...morningIntake.garlicHerbs,
                types: text,
              })
            }
          />
          <CheckboxWithText
            label="Soaked Dry Fruits"
            subLabel="Quantity"
            checked={morningIntake.soakedDryFruits?.checked || false}
            textValue={morningIntake.soakedDryFruits?.quantity || ""}
            onCheckedChange={(checked) =>
              updateFormData(["morningIntake", "soakedDryFruits"], {
                ...morningIntake.soakedDryFruits,
                checked,
              })
            }
            onTextChange={(text) =>
              updateFormData(["morningIntake", "soakedDryFruits"], {
                ...morningIntake.soakedDryFruits,
                quantity: text,
              })
            }
          />
          <CheckboxWithText
            label="Biscuit / Toast"
            subLabel="Quantity"
            checked={morningIntake.biscuitToast?.checked || false}
            textValue={morningIntake.biscuitToast?.quantity || ""}
            onCheckedChange={(checked) =>
              updateFormData(["morningIntake", "biscuitToast"], {
                ...morningIntake.biscuitToast,
                checked,
              })
            }
            onTextChange={(text) =>
              updateFormData(["morningIntake", "biscuitToast"], {
                ...morningIntake.biscuitToast,
                quantity: text,
              })
            }
          />
          <TextArea
            label="Fruits"
            value={morningIntake.fruits || ""}
            onChange={(val) => updateFormData(["morningIntake", "fruits"], val)}
            small
          />
          <TextArea
            label="Fruit Quantity"
            value={morningIntake.fruitQuantity || ""}
            onChange={(val) =>
              updateFormData(["morningIntake", "fruitQuantity"], val)
            }
            small
          />
        </div>
      </SubSection>

      {/* Breakfast */}
      <SubSection title="Breakfast">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          <TextArea
            label="Time"
            value={breakfast.time || ""}
            onChange={(val) => updateFormData(["breakfast", "time"], val)}
            isTime
          />
          {[
            "Poha",
            "Upma",
            "Paratha",
            "Stuffed Paratha",
            "Puri",
            "Idly/Dosa",
            "Bread Butter",
            "Sandwich",
            "Egg",
            "Juice",
            "Fruits",
            "Milk",
          ].map((item) => (
            <FoodQty
              key={item}
              label={item}
              checked={
                breakfast[item.toLowerCase().replace(/[ /]/g, "")]?.checked ||
                false
              }
              quantity={
                breakfast[item.toLowerCase().replace(/[ /]/g, "")]?.quantity ||
                ""
              }
              onCheckedChange={(checked) =>
                updateFormData(
                  ["breakfast", item.toLowerCase().replace(/[ /]/g, "")],
                  {
                    ...breakfast[item.toLowerCase().replace(/[ /]/g, "")],
                    checked,
                  }
                )
              }
              onQuantityChange={(qty) =>
                updateFormData(
                  ["breakfast", item.toLowerCase().replace(/[ /]/g, "")],
                  {
                    ...breakfast[item.toLowerCase().replace(/[ /]/g, "")],
                    quantity: qty,
                  }
                )
              }
            />
          ))}
          <div className="sm:col-span-2 lg:col-span-1">
            <Checkbox
              label="Roti"
              checked={breakfast.roti?.checked || false}
              onChange={(checked) =>
                updateFormData(["breakfast", "roti"], {
                  ...breakfast.roti,
                  checked,
                })
              }
            />
          </div>
          <div className="md:col-span-2">
            <Radio
              label="Roti Ghee"
              options={["With Ghee", "Without Ghee"]}
              value={breakfast.roti?.ghee || ""}
              onChange={(val) =>
                updateFormData(["breakfast", "roti"], {
                  ...breakfast.roti,
                  ghee: val,
                })
              }
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <TextArea
              label="Other"
              value={breakfast.other || ""}
              onChange={(val) => updateFormData(["breakfast", "other"], val)}
            />
          </div>
        </div>
      </SubSection>

      {/* Mid Morning */}
      <SubSection title="Mid Morning">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          <TextArea
            label="Time"
            value={midMorning.time || ""}
            onChange={(val) => updateFormData(["midMorning", "time"], val)}
            isTime
          />
          {["Buttermilk", "Curd", "Fruit", "Tea / Coffee", "Other"].map(
            (item) => (
              <FoodQty
                key={item}
                label={item}
                checked={
                  midMorning[item.toLowerCase().replace(/[ /]/g, "")]
                    ?.checked || false
                }
                quantity={
                  midMorning[item.toLowerCase().replace(/[ /]/g, "")]
                    ?.quantity || ""
                }
                onCheckedChange={(checked) =>
                  updateFormData(
                    ["midMorning", item.toLowerCase().replace(/[ /]/g, "")],
                    {
                      ...midMorning[item.toLowerCase().replace(/[ /]/g, "")],
                      checked,
                    }
                  )
                }
                onQuantityChange={(qty) =>
                  updateFormData(
                    ["midMorning", item.toLowerCase().replace(/[ /]/g, "")],
                    {
                      ...midMorning[item.toLowerCase().replace(/[ /]/g, "")],
                      quantity: qty,
                    }
                  )
                }
              />
            )
          )}
        </div>
      </SubSection>

      {/* Lunch */}
      <SubSection title="Lunch">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          <TextArea
            label="Time"
            value={lunch.time || ""}
            onChange={(val) => updateFormData(["lunch", "time"], val)}
            isTime
          />
          <Qty5Select
            label="Rice (Bowls)"
            value={lunch.rice?.bowls || ""}
            onValueChange={(val) =>
              updateFormData(["lunch", "rice"], { ...lunch.rice, bowls: val })
            }
          />
          <Select
            label="Rice Type"
            options={["White", "Brown", "Usna/Steam", "Starch Free"]}
            value={lunch.rice?.type || ""}
            onChange={(val) =>
              updateFormData(["lunch", "rice"], { ...lunch.rice, type: val })
            }
          />
          <Qty5Select
            label="Roti (Count)"
            value={lunch.roti?.count || ""}
            onValueChange={(val) =>
              updateFormData(["lunch", "roti"], { ...lunch.roti, count: val })
            }
          />
          <Qty5Select
            label="Dal (Bowls)"
            value={lunch.dal?.bowls || ""}
            onValueChange={(val) =>
              updateFormData(["lunch", "dal"], { ...lunch.dal, bowls: val })
            }
          />
          <Select
            label="Dal Type"
            options={["Yellow", "Black", "Moong", "Masoor", "Moth", "Mix"]}
            value={lunch.dal?.type || ""}
            onChange={(val) =>
              updateFormData(["lunch", "dal"], { ...lunch.dal, type: val })
            }
          />
          <div className="md:col-span-2">
            <TextArea
              label="Other Dal Type"
              value={lunch.dal?.otherType || ""}
              onChange={(val) =>
                updateFormData(["lunch", "dal"], {
                  ...lunch.dal,
                  otherType: val,
                })
              }
              small
            />
          </div>
          <Qty5Select
            label="Sambhar (Bowls)"
            value={lunch.sambhar?.bowls || ""}
            onValueChange={(val) =>
              updateFormData(["lunch", "sambhar"], {
                ...lunch.sambhar,
                bowls: val,
              })
            }
          />
          <Select
            label="Sambhar Type"
            options={["Yellow", "Black", "Moong", "Masoor", "Moth", "Mix"]}
            value={lunch.sambhar?.type || ""}
            onChange={(val) =>
              updateFormData(["lunch", "sambhar"], {
                ...lunch.sambhar,
                type: val,
              })
            }
          />
          <div className="md:col-span-2">
            <TextArea
              label="Other Sambhar Type"
              value={lunch.sambhar?.otherType || ""}
              onChange={(val) =>
                updateFormData(["lunch", "sambhar"], {
                  ...lunch.sambhar,
                  otherType: val,
                })
              }
              small
            />
          </div>
          <Qty5Select
            label="Curd/Kadhi (Bowls)"
            value={lunch.curdKadhi?.bowls || ""}
            onValueChange={(val) =>
              updateFormData(["lunch", "curdKadhi"], {
                ...lunch.curdKadhi,
                bowls: val,
              })
            }
          />
          <Qty5Select
            label="Chole/Rajma/Beans (Bowls)"
            value={lunch.choleRajmaBeans?.bowls || ""}
            onValueChange={(val) =>
              updateFormData(["lunch", "choleRajmaBeans"], {
                ...lunch.choleRajmaBeans,
                bowls: val,
              })
            }
          />
          {["Chicken", "Fish", "Mutton", "Seafood"].map((item) => (
            <FoodQty
              key={item}
              label={item}
              checked={lunch[item.toLowerCase()]?.checked || false}
              quantity={lunch[item.toLowerCase()]?.quantity || ""}
              onCheckedChange={(checked) =>
                updateFormData(["lunch", item.toLowerCase()], {
                  ...lunch[item.toLowerCase()],
                  checked,
                })
              }
              onQuantityChange={(qty) =>
                updateFormData(["lunch", item.toLowerCase()], {
                  ...lunch[item.toLowerCase()],
                  quantity: qty,
                })
              }
            />
          ))}
          {["Pulao", "Khichdi", "Biryani"].map((item) => (
            <Qty5Select
              key={item}
              label={item}
              checkbox
              checked={lunch[item.toLowerCase()]?.checked || false}
              value={lunch[item.toLowerCase()]?.bowls || ""}
              onCheckedChange={(checked) =>
                updateFormData(["lunch", item.toLowerCase()], {
                  ...lunch[item.toLowerCase()],
                  checked,
                })
              }
              onValueChange={(val) =>
                updateFormData(["lunch", item.toLowerCase()], {
                  ...lunch[item.toLowerCase()],
                  bowls: val,
                })
              }
            />
          ))}
          <div className="md:col-span-2">
            <Checkbox
              label="Salad"
              checked={lunch.salad?.checked || false}
              onChange={(checked) =>
                updateFormData(["lunch", "salad"], { ...lunch.salad, checked })
              }
            />
          </div>
          <TextArea
            label="Salad Type"
            value={lunch.salad?.type || ""}
            onChange={(val) =>
              updateFormData(["lunch", "salad"], { ...lunch.salad, type: val })
            }
            small
          />
          <TextArea
            label="Salad Quantity"
            value={lunch.salad?.quantity || ""}
            onChange={(val) =>
              updateFormData(["lunch", "salad"], {
                ...lunch.salad,
                quantity: val,
              })
            }
            small
          />
          <CheckboxWithText
            label="Chutney"
            subLabel="Type"
            checked={lunch.chutney?.checked || false}
            textValue={lunch.chutney?.type || ""}
            onCheckedChange={(checked) =>
              updateFormData(["lunch", "chutney"], {
                ...lunch.chutney,
                checked,
              })
            }
            onTextChange={(text) =>
              updateFormData(["lunch", "chutney"], {
                ...lunch.chutney,
                type: text,
              })
            }
          />
          <Checkbox
            label="Pickle"
            checked={lunch.pickle?.checked || false}
            onChange={(checked) =>
              updateFormData(["lunch", "pickle"], { checked })
            }
          />
          <div className="md:col-span-2">
            <TextArea
              label="Other"
              value={lunch.other || ""}
              onChange={(val) => updateFormData(["lunch", "other"], val)}
            />
          </div>
          <div className="md:col-span-2">
            <TextArea
              label="Other Quantity"
              value={lunch.otherQuantity || ""}
              onChange={(val) =>
                updateFormData(["lunch", "otherQuantity"], val)
              }
              small
            />
          </div>
        </div>
      </SubSection>

      {/* Mid Day */}
      <SubSection title="Mid Day">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          <TextArea
            label="Time"
            value={midDay.time || ""}
            onChange={(val) => updateFormData(["midDay", "time"], val)}
            isTime
          />
          {["Sweets", "Dessert", "Laddu", "Fruits"].map((item) => (
            <Qty5Select
              key={item}
              label={item}
              checkbox
              checked={midDay[item.toLowerCase()]?.checked || false}
              value={midDay[item.toLowerCase()]?.bowls || ""}
              onCheckedChange={(checked) =>
                updateFormData(["midDay", item.toLowerCase()], {
                  ...midDay[item.toLowerCase()],
                  checked,
                })
              }
              onValueChange={(val) =>
                updateFormData(["midDay", item.toLowerCase()], {
                  ...midDay[item.toLowerCase()],
                  bowls: val,
                })
              }
            />
          ))}
          <div className="md:col-span-2">
            <TextArea
              label="Other"
              value={midDay.other || ""}
              onChange={(val) => updateFormData(["midDay", "other"], val)}
              small
            />
          </div>
          <div className="md:col-span-2">
            <TextArea
              label="Other Quantity"
              value={midDay.otherQuantity || ""}
              onChange={(val) =>
                updateFormData(["midDay", "otherQuantity"], val)
              }
              small
            />
          </div>
        </div>
      </SubSection>

      {/* Evening Snack */}
      <SubSection title="Evening Snack">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          <TextArea
            label="Time"
            value={eveningSnack.time || ""}
            onChange={(val) => updateFormData(["eveningSnack", "time"], val)}
            isTime
          />
          {["Biscuit / Toast", "Namkeen", "Chana", "Makhana", "Groundnuts"].map(
            (item) => (
              <FoodQty
                key={item}
                label={item}
                checked={
                  eveningSnack[item.toLowerCase().replace(/[ /]/g, "")]
                    ?.checked || false
                }
                quantity={
                  eveningSnack[item.toLowerCase().replace(/[ /]/g, "")]
                    ?.quantity || ""
                }
                onCheckedChange={(checked) =>
                  updateFormData(
                    ["eveningSnack", item.toLowerCase().replace(/[ /]/g, "")],
                    {
                      ...eveningSnack[item.toLowerCase().replace(/[ /]/g, "")],
                      checked,
                    }
                  )
                }
                onQuantityChange={(qty) =>
                  updateFormData(
                    ["eveningSnack", item.toLowerCase().replace(/[ /]/g, "")],
                    {
                      ...eveningSnack[item.toLowerCase().replace(/[ /]/g, "")],
                      quantity: qty,
                    }
                  )
                }
              />
            )
          )}
          {["Poha", "Upma", "Sandwich", "Dosa"].map((item) => (
            <Qty5Select
              key={item}
              label={item}
              checkbox
              checked={eveningSnack[item.toLowerCase()]?.checked || false}
              value={eveningSnack[item.toLowerCase()]?.bowls || ""}
              onCheckedChange={(checked) =>
                updateFormData(["eveningSnack", item.toLowerCase()], {
                  ...eveningSnack[item.toLowerCase()],
                  checked,
                })
              }
              onValueChange={(val) =>
                updateFormData(["eveningSnack", item.toLowerCase()], {
                  ...eveningSnack[item.toLowerCase()],
                  bowls: val,
                })
              }
            />
          ))}
          <div className="sm:col-span-2 lg:col-span-1">
            <Checkbox
              label="Tea / Coffee"
              checked={eveningSnack.teaCoffee?.checked || false}
              onChange={(checked) =>
                updateFormData(["eveningSnack", "teaCoffee"], { checked })
              }
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <Checkbox
              label="Milk"
              checked={eveningSnack.milk?.checked || false}
              onChange={(checked) =>
                updateFormData(["eveningSnack", "milk"], { checked })
              }
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <TextArea
              label="Other"
              value={eveningSnack.other || ""}
              onChange={(val) => updateFormData(["eveningSnack", "other"], val)}
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <TextArea
              label="Other Quantity"
              value={eveningSnack.otherQuantity || ""}
              onChange={(val) =>
                updateFormData(["eveningSnack", "otherQuantity"], val)
              }
              small
            />
          </div>
        </div>
      </SubSection>

      {/* Dinner - Full Lunch + Mid-Day Fields */}
      <SubSection title="Dinner">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          <TextArea
            label="Time"
            value={dinner.time || ""}
            onChange={(val) => updateFormData(["dinner", "time"], val)}
            isTime
          />
          <div className="sm:col-span-1"></div>

          {/* Lunch Fields */}
          <Qty5Select
            label="Rice (Bowls)"
            value={dinner.rice?.bowls || ""}
            onValueChange={(val) =>
              updateFormData(["dinner", "rice"], { ...dinner.rice, bowls: val })
            }
          />
          <Select
            label="Rice Type"
            options={["White", "Brown", "Usna/Steam", "Starch Free"]}
            value={dinner.rice?.type || ""}
            onChange={(val) =>
              updateFormData(["dinner", "rice"], { ...dinner.rice, type: val })
            }
          />
          <Qty5Select
            label="Roti (Count)"
            value={dinner.roti?.count || ""}
            onValueChange={(val) =>
              updateFormData(["dinner", "roti"], { ...dinner.roti, count: val })
            }
          />
          <div className="sm:col-span-2"></div>

          <Qty5Select
            label="Dal (Bowls)"
            value={dinner.dal?.bowls || ""}
            onValueChange={(val) =>
              updateFormData(["dinner", "dal"], { ...dinner.dal, bowls: val })
            }
          />
          <Select
            label="Dal Type"
            options={["Yellow", "Black", "Moong", "Masoor", "Moth", "Mix"]}
            value={dinner.dal?.type || ""}
            onChange={(val) =>
              updateFormData(["dinner", "dal"], { ...dinner.dal, type: val })
            }
          />
          <div className="sm:col-span-2">
            <TextArea
              label="Other Dal Type"
              value={dinner.dal?.otherType || ""}
              onChange={(val) =>
                updateFormData(["dinner", "dal"], {
                  ...dinner.dal,
                  otherType: val,
                })
              }
              small
            />
          </div>

          <Qty5Select
            label="Sambhar (Bowls)"
            value={dinner.sambhar?.bowls || ""}
            onValueChange={(val) =>
              updateFormData(["dinner", "sambhar"], {
                ...dinner.sambhar,
                bowls: val,
              })
            }
          />
          <Select
            label="Sambhar Type"
            options={["Yellow", "Black", "Moong", "Masoor", "Moth", "Mix"]}
            value={dinner.sambhar?.type || ""}
            onChange={(val) =>
              updateFormData(["dinner", "sambhar"], {
                ...dinner.sambhar,
                type: val,
              })
            }
          />
          <div className="sm:col-span-2">
            <TextArea
              label="Other Sambhar Type"
              value={dinner.sambhar?.otherType || ""}
              onChange={(val) =>
                updateFormData(["dinner", "sambhar"], {
                  ...dinner.sambhar,
                  otherType: val,
                })
              }
              small
            />
          </div>

          <Qty5Select
            label="Curd/Kadhi (Bowls)"
            value={dinner.curdKadhi?.bowls || ""}
            onValueChange={(val) =>
              updateFormData(["dinner", "curdKadhi"], {
                ...dinner.curdKadhi,
                bowls: val,
              })
            }
          />
          <Qty5Select
            label="Chole/Rajma/Beans (Bowls)"
            value={dinner.choleRajmaBeans?.bowls || ""}
            onValueChange={(val) =>
              updateFormData(["dinner", "choleRajmaBeans"], {
                ...dinner.choleRajmaBeans,
                bowls: val,
              })
            }
          />

          {["Chicken", "Fish", "Mutton", "Seafood"].map((item) => (
            <FoodQty
              key={item}
              label={item}
              checked={dinner[item.toLowerCase()]?.checked || false}
              quantity={dinner[item.toLowerCase()]?.quantity || ""}
              onCheckedChange={(checked) =>
                updateFormData(["dinner", item.toLowerCase()], {
                  ...dinner[item.toLowerCase()],
                  checked,
                })
              }
              onQuantityChange={(qty) =>
                updateFormData(["dinner", item.toLowerCase()], {
                  ...dinner[item.toLowerCase()],
                  quantity: qty,
                })
              }
            />
          ))}

          {["Pulao", "Khichdi", "Biryani"].map((item) => (
            <Qty5Select
              key={item}
              label={item}
              checkbox
              checked={dinner[item.toLowerCase()]?.checked || false}
              value={dinner[item.toLowerCase()]?.bowls || ""}
              onCheckedChange={(checked) =>
                updateFormData(["dinner", item.toLowerCase()], {
                  ...dinner[item.toLowerCase()],
                  checked,
                })
              }
              onValueChange={(val) =>
                updateFormData(["dinner", item.toLowerCase()], {
                  ...dinner[item.toLowerCase()],
                  bowls: val,
                })
              }
            />
          ))}

          <div className="sm:col-span-2">
            <Checkbox
              label="Salad"
              checked={dinner.salad?.checked || false}
              onChange={(checked) =>
                updateFormData(["dinner", "salad"], {
                  ...dinner.salad,
                  checked,
                })
              }
            />
          </div>
          <TextArea
            label="Salad Type"
            value={dinner.salad?.type || ""}
            onChange={(val) =>
              updateFormData(["dinner", "salad"], {
                ...dinner.salad,
                type: val,
              })
            }
            small
          />
          <TextArea
            label="Salad Quantity"
            value={dinner.salad?.quantity || ""}
            onChange={(val) =>
              updateFormData(["dinner", "salad"], {
                ...dinner.salad,
                quantity: val,
              })
            }
            small
          />

          <CheckboxWithText
            label="Chutney"
            subLabel="Type"
            checked={dinner.chutney?.checked || false}
            textValue={dinner.chutney?.type || ""}
            onCheckedChange={(checked) =>
              updateFormData(["dinner", "chutney"], {
                ...dinner.chutney,
                checked,
              })
            }
            onTextChange={(text) =>
              updateFormData(["dinner", "chutney"], {
                ...dinner.chutney,
                type: text,
              })
            }
          />
          <Checkbox
            label="Pickle"
            checked={dinner.pickle?.checked || false}
            onChange={(checked) =>
              updateFormData(["dinner", "pickle"], { checked })
            }
          />

          <div className="sm:col-span-2">
            <TextArea
              label="Other"
              value={dinner.other || ""}
              onChange={(val) => updateFormData(["dinner", "other"], val)}
            />
          </div>
          <div className="sm:col-span-2">
            <TextArea
              label="Other Quantity"
              value={dinner.otherQuantity || ""}
              onChange={(val) =>
                updateFormData(["dinner", "otherQuantity"], val)
              }
              small
            />
          </div>

          {/* Mid-Day Fields */}
          <div className="sm:col-span-2 border-t-2 border-emerald-200 pt-4 mt-2">
            <h4 className="text-base sm:text-lg font-semibold text-emerald-700 mb-4">
              Additional Items
            </h4>
          </div>

          {["Sweets", "Dessert", "Laddu", "Fruits"].map((item) => (
            <Qty5Select
              key={item}
              label={item}
              checkbox
              checked={dinner[item.toLowerCase()]?.checked || false}
              value={dinner[item.toLowerCase()]?.bowls || ""}
              onCheckedChange={(checked) =>
                updateFormData(["dinner", item.toLowerCase()], {
                  ...dinner[item.toLowerCase()],
                  checked,
                })
              }
              onValueChange={(val) =>
                updateFormData(["dinner", item.toLowerCase()], {
                  ...dinner[item.toLowerCase()],
                  bowls: val,
                })
              }
            />
          ))}

          <div className="sm:col-span-2">
            <TextArea
              label="Other"
              value={dinner.midDayOther || ""}
              onChange={(val) => updateFormData(["dinner", "midDayOther"], val)}
              small
            />
          </div>
          <div className="sm:col-span-2">
            <TextArea
              label="Other Quantity"
              value={dinner.midDayOtherQuantity || ""}
              onChange={(val) =>
                updateFormData(["dinner", "midDayOtherQuantity"], val)
              }
              small
            />
          </div>
        </div>
      </SubSection>
    </div>
  );
}
