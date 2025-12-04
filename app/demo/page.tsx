"use client";
import React from "react";

export default function DoctorNotesFullUI() {
  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-12">
      <h1 className="text-4xl font-bold mb-10">
        Doctor Notes — Full Intake Form
      </h1>

      {/* ------------------------------------------------------- */}
      {/* SECTION 1 — PERSONAL INFO */}
      {/* ------------------------------------------------------- */}
      <Section title="SECTION 1 — PERSONAL INFO">
        <TextArea label="Personal History" />
        <TextArea label="Reason for Joining Program" />
        <Input label="Ethnicity" />

        <DateInput label="Joining Date" />
        <DateInput label="Expiry Date" />
        <DateInput label="Diet Prescription Date" />

        <TextArea label="Duration of Diet" />

        <Radio label="Previous Diet Taken" options={["Yes", "No"]} />
        <TextArea label="If Yes, Mention Details" />
        <Select
          label="Type of Diet Taken"
          options={["By Google", "By Experts"]}
        />

        <Select label="Marital Status" options={["Married", "Unmarried"]} />
        <Input label="Number of Children" type="number" />

        <Select
          label="Diet Preference"
          options={["Veg", "Non-Veg", "Egg & Veg"]}
        />

        <TextArea label="Wakeup Time" />
        <TextArea label="Bed Time" />
        <TextArea label="Day Nap" />

        <Select
          label="Workout Timing"
          options={["Morning", "Afternoon", "Evening", "Night"]}
        />

        <Select
          label="Workout Type"
          options={["Sport Type", "Yoga", "Gym", "Homebase"]}
        />
      </Section>

      {/* ------------------------------------------------------- */}
      {/* SECTION 2 — 24 HOUR FOOD RECALL */}
      {/* ------------------------------------------------------- */}
      <Section title="SECTION 2 — 24-HOUR FOOD RECALL">
        {/* ---------------- MORNING ---------------- */}
        <SubSection title="Morning Intake">
          <TextArea label="Time" />
          <Input label="Water Intake (Number)" type="number" />
          <TextArea label="Any Medicines" />

          <CheckboxWithText label="Tea" subLabel="Tea Type" />
          <Checkbox label="Coffee" />
          <Checkbox label="Lemon Water" />
          <CheckboxWithText label="Garlic & Other Herbs" subLabel="Types" />

          <CheckboxWithText label="Soaked Dry Fruits" subLabel="Quantity" />

          <CheckboxWithText label="Biscuit / Toast" subLabel="Quantity" />

          <TextArea label="Fruits" />
          <TextArea label="Fruit Quantity" />
        </SubSection>

        {/* ---------------- BREAKFAST ---------------- */}
        <SubSection title="Breakfast">
          <FoodQty label="Poha" />
          <FoodQty label="Upma" />
          <FoodQty label="Paratha" />
          <FoodQty label="Stuffed Paratha" />
          <FoodQty label="Puri" />

          <Checkbox label="Roti" />
          <Radio label="Roti Ghee" options={["With Ghee", "Without Ghee"]} />

          <FoodQty label="Idly/Dosa" />
          <FoodQty label="Bread Butter" />
          <FoodQty label="Sandwich" />
          <FoodQty label="Egg" />
          <FoodQty label="Juice" />
          <FoodQty label="Fruits" />
          <FoodQty label="Milk" />

          <TextArea label="Other" />
        </SubSection>

        {/* ---------------- MID MORNING ---------------- */}
        <SubSection title="Mid Morning">
          <FoodQty label="Buttermilk" />
          <FoodQty label="Curd" />
          <FoodQty label="Fruit" />
          <FoodQty label="Tea / Coffee" />
          <FoodQty label="Other" />
        </SubSection>

        {/* ---------------- LUNCH ---------------- */}
        <SubSection title="Lunch">
          <Qty5Select label="Rice (Bowls)" />
          <Select
            label="Rice Type"
            options={["White", "Brown", "Usna/Steam", "Starch Free"]}
          />

          <Qty5Select label="Roti (Count)" />

          <Qty5Select label="Dal (Bowls)" />
          <Select
            label="Dal Type"
            options={["Yellow", "Black", "Moong", "Masoor", "Moth", "Mix"]}
          />
          <TextArea label="Other Dal Type" />

          <Qty5Select label="Sambhar (Bowls)" />
          <Select
            label="Sambhar Type"
            options={["Yellow", "Black", "Moong", "Masoor", "Moth", "Mix"]}
          />
          <TextArea label="Other Sambhar Type" />

          <Qty5Select label="Curd/Kadhi (Bowls)" />
          <Qty5Select label="Chole/Rajma/Beans (Bowls)" />

          <FoodQty label="Chicken" />
          <FoodQty label="Fish" />
          <FoodQty label="Mutton" />
          <FoodQty label="Seafood" />

          <Qty5Select label="Pulao" checkbox />
          <Qty5Select label="Khichdi" checkbox />
          <Qty5Select label="Biryani" checkbox />

          <Checkbox label="Salad" />
          <TextArea label="Salad Type" />
          <TextArea label="Salad Quantity" />

          <CheckboxWithText label="Chutney" subLabel="Type" />
          <Checkbox label="Pickle" />

          <TextArea label="Other" />
          <TextArea label="Other Quantity" />
        </SubSection>

        {/* ---------------- MID DAY ---------------- */}
        <SubSection title="Mid Day">
          <Qty5Select label="Sweets" checkbox />
          <Qty5Select label="Dessert" checkbox />
          <Qty5Select label="Laddu" checkbox />
          <Qty5Select label="Fruits" checkbox />
          <TextArea label="Other" />
          <TextArea label="Other Quantity" />
        </SubSection>

        {/* ---------------- EVENING SNACK ---------------- */}
        <SubSection title="Evening Snack">
          <FoodQty label="Biscuit / Toast" />
          <FoodQty label="Namkeen" />
          <Qty5Select label="Poha" checkbox />
          <Qty5Select label="Upma" checkbox />
          <Qty5Select label="Sandwich" checkbox />
          <Qty5Select label="Dosa" checkbox />
          <FoodQty label="Chana" />
          <FoodQty label="Makhana" />
          <FoodQty label="Groundnuts" />

          <Checkbox label="Tea / Coffee" />
          <Checkbox label="Milk" />

          <TextArea label="Other" />
          <TextArea label="Other Quantity" />
        </SubSection>

        {/* ---------------- DINNER ---------------- */}
        <SubSection title="Dinner (Same as Lunch + Mid-Day)">
          <p className="text-gray-600">
            *Dinner repeats the same fields as Lunch + Mid-day sections.*
          </p>
        </SubSection>
      </Section>

      {/* ------------------------------------------------------- */}
      {/* SECTION 3 — WEEKEND DIET */}
      {/* ------------------------------------------------------- */}
      <Section title="SECTION 3 — Weekend Diet">
        <TextArea label="Snacks" />
        <TextArea label="Starters" />
        <TextArea label="Main Course" />

        <Select
          label="Changes in Diet"
          options={[
            "Same",
            "Skip things in weekend",
            "Difference in timing/food pattern/schedule",
          ]}
        />

        <TextArea label="Eating Out — Food Items" />
        <Select
          label="Eating Out — Frequency"
          options={[
            "Daily",
            "Times in week",
            "Times in month",
            "Times in 6 months",
          ]}
        />

        <TextArea label="Ordered From Outside — Food Items" />

        <FoodQty label="Snacks List" />
        <FoodQty label="Starter List" />
        <FoodQty label="Main Course List" />
        <FoodQty label="Sweet Item List" />

        <TextArea label="Sleeping Time (Weekend)" />
        <TextArea label="Wakeup Time (Weekend)" />
        <TextArea label="Nap Time (Weekend)" />
      </Section>

      {/* ------------------------------------------------------- */}
      {/* SECTION 4 — QUESTIONNAIRE */}
      {/* ------------------------------------------------------- */}
      <Section title="SECTION 4 — Questionnaire For Recall">
        <Radio label="Food Allergies" options={["Yes", "No"]} />
        <Radio label="Food Intolerance" options={["Yes", "No"]} />

        <Select
          label="Intolerance Type"
          options={[
            "Soya",
            "Gluten",
            "Lactose",
            "Citrus Fruits",
            "Egg",
            "Milk",
            "Curd",
            "Other",
          ]}
        />

        <Select label="Eating Speed" options={["Quick", "Slow", "Moderate"]} />

        <Select
          label="Activity During Meal"
          options={["Work on PC", "Phone", "TV", "Discussions", "N/A", "Other"]}
        />

        <Radio label="Hunger Pangs" options={["Yes", "No"]} />

        <Select
          label="Hunger Pangs Time"
          options={["Morning", "Afternoon", "Evening", "Night"]}
        />

        <Radio
          label="Emotional Eater / Mood-based Eating"
          options={["Yes", "No"]}
        />

        <TextArea label="Describe Emotional Eating" />

        <Select label="Main Meal" options={["Breakfast", "Lunch", "Dinner"]} />

        <TextArea label="Snack Foods You Prefer" />

        <Radio label="Crave Sweets?" options={["Yes", "No"]} />

        <TextArea label="Sweet Types (Chocolates/Indian Sweets)" />

        <TextArea label="Specific Likes" />
        <TextArea label="Specific Dislikes" />

        <Radio label="Fasting in Week?" options={["Yes", "No"]} />
        <Select
          label="Fasting Reason"
          options={["Religious Based", "Personal Based"]}
        />
      </Section>

      {/* ------------------------------------------------------- */}
      {/* SECTION 5 — FOOD FREQUENCY */}
      {/* ------------------------------------------------------- */}
      <Section title="SECTION 5 — Food Frequency">
        <SubSection title="Non-Veg">
          <FoodPrep label="Fish" prepOptions={["Dry Form", "Curry Form"]} />
          <FoodPrep
            label="White Meat"
            prepOptions={["Dry Form", "Curry Form"]}
          />
          <FoodPrep label="Mutton" prepOptions={["Dry Form", "Curry Form"]} />
          <FoodPrep label="Sea Fish" prepOptions={["Dry Form", "Curry Form"]} />
          <FoodPrep
            label="Egg"
            prepOptions={["Boiled", "Burnt", "Omelette", "Poach"]}
          />
        </SubSection>

        <SubSection title="Dairy">
          <Qty5Select label="Milk (Glass)" checkbox />
          <Radio
            label="Curd / Buttermilk"
            options={["Daily", "Weekly", "Monthly"]}
          />
        </SubSection>

        <SubSection title="Packaged / Daily Items">
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
          ].map((i) => (
            <Frequency key={i} label={i} />
          ))}

          <Frequency label="Bread" extra={["Once a week"]} />
          <Frequency label="Paneer" extra={["Once in 10 days"]} />
        </SubSection>

        <SubSection title="Sweeteners">
          <SweetQty label="Sugar" />
          <SweetQty label="Honey" />
          <SweetQty label="Jaggery" />
        </SubSection>

        <SubSection title="Drinks">
          <DrinkQty label="Tea" />
          <DrinkQty label="Coffee" />
        </SubSection>

        <SubSection title="Lifestyle">
          <DrinkQty label="Smoking" />
          <DrinkQty label="Tobacco" />
          <AlcoholQty label="Alcohol" />
        </SubSection>

        <SubSection title="Water">
          <DrinkQty label="Water" />
        </SubSection>

        <SubSection title="Healthy Foods">
          <DrinkQty label="Leafy Veg (Bowls)" />
          <DrinkQty label="Fresh Fruits" />
          <DrinkQty label="Dry Fruits & Nuts" />
          <DrinkQty label="Veg Salad" />
        </SubSection>

        <SubSection title="Eating Out">
          <Frequency label="Eating Out" />
        </SubSection>

        <SubSection title="Coconut">
          <Frequency label="Coconut (Dry / Fresh)" />
        </SubSection>

        <SubSection title="Pizza/Burger">
          <DrinkQty label="Pizza/Burger" />
        </SubSection>

        <SubSection title="Oil / Fat">
          <Select
            label="Type of Oil"
            options={["Sunflower", "Soyabean", "Vegetable Oil", "Rice Bran"]}
          />

          <Select
            label="Oil Per Month"
            options={["1L", "2L", "3L", "4L", "5L"]}
          />

          <TextArea label="Total Members in House" />
          <Radio label="Reuse Fried Oil in Cooking?" options={["Yes", "No"]} />
        </SubSection>
      </Section>

      {/* ------------------------------------------------------- */}
      {/* SECTION 6 — HEALTH PROFILE */}
      {/* ------------------------------------------------------- */}
      <Section title="SECTION 6 — Health Profile">
        <Select
          label="Physical Activity Level"
          options={["Sedentary", "Moderate", "Heavy"]}
        />

        <Select
          label="Sleep Quality"
          options={["Normal", "Inadequate", "Disturbed", "Insomnia"]}
        />

        <TextArea label="Insomnia/Pills Details" />
        <TextArea label="Disturbance Due to Urine Break" />

        {[
          "High B.P",
          "Diabetes",
          "High Cholesterol",
          "Obesity",
          "Cardiac Risk",
          "Heart Problem",
          "Back Pain",
          "Neck Pain",
          "Knee Pain",
          "Shoulder Pain",
          "Respiratory Problem (Asthma/Breathlessness)",
          "Post-Operative",
          "Hormonal Problem",
          "Thyroid",
          "PCOD",
          "PCOS",
          "Gynec Problem",
          "Gastric Problem",
          "Acidity",
          "Constipation",
          "Allergy",
          "Water Retention",
        ].map((i) => (
          <Radio key={i} label={i} options={["Yes", "No"]} />
        ))}

        <TextArea label="Medication Name" />
        <TextArea label="Medication Reason" />
        <TextArea label="Medication Timing & Quantity" />

        <Radio label="Pregnancy" options={["Yes", "No"]} />
        <Radio label="Planning Pregnancy" options={["Yes", "No"]} />
        <TextArea label="If Yes, Planning When?" />

        <SubSection title="Family History">
          <TextArea label="Father" />
          <TextArea label="Mother" />
          <TextArea label="Sibling(s)" />
        </SubSection>
      </Section>

      {/* ------------------------------------------------------- */}
      {/* SECTION 7 — DIET PRESCRIBED */}
      {/* ------------------------------------------------------- */}
      <Section title="SECTION 7 — Diet Prescribed">
        <DateInput label="Joining Date" />
        <DateInput label="Expiry Date" />
        <DateInput label="Diet Prescription Date" />
        <DateInput label="Date" />

        <TextArea label="Duration of Diet" />
        <TextArea label="Diet Chart" />
        <Input label="Code" />
      </Section>

      <button className="px-8 py-4 bg-blue-600 text-white text-xl rounded-lg w-full">
        SUBMIT (UI Only)
      </button>
    </div>
  );
}

/* ------------------------------------------------------ */
/* ---------------- REUSABLE COMPONENTS ----------------- */
/* ------------------------------------------------------ */

function Section({ title, children }: any) {
  return (
    <div className="border border-gray-300 rounded-xl p-6 space-y-6 bg-white shadow-sm">
      <h2 className="text-2xl font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function SubSection({ title, children }: any) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
      <h3 className="text-xl font-medium">{title}</h3>
      {children}
    </div>
  );
}

function Input({ label, type = "text" }: any) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <input type={type} className="w-full border p-2 rounded" />
    </div>
  );
}

function DateInput({ label }: any) {
  return <Input label={label} type="date" />;
}

function TextArea({ label }: any) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <textarea className="w-full border p-2 rounded h-24" />
    </div>
  );
}

function Radio({ label, options }: any) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <div className="flex flex-wrap gap-4">
        {options.map((o: string) => (
          <label key={o} className="flex items-center gap-2">
            <input type="radio" name={label} />
            {o}
          </label>
        ))}
      </div>
    </div>
  );
}

function Checkbox({ label }: any) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" />
      {label}
    </label>
  );
}

function CheckboxWithText({ label, subLabel }: any) {
  return (
    <div className="space-y-2">
      <Checkbox label={label} />
      <TextArea label={subLabel} />
    </div>
  );
}

function Select({ label, options }: any) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <select className="w-full border p-2 rounded">
        {options.map((o: string) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function FoodQty({ label }: any) {
  return (
    <div className="space-y-2">
      <Checkbox label={label} />
      <TextArea label={`${label} Quantity`} />
    </div>
  );
}

function Qty5Select({ label, checkbox = false }: any) {
  return (
    <div className="space-y-2">
      {checkbox && <Checkbox label={label} />}
      <label className="block font-medium">{label}</label>
      <select className="w-full border p-2 rounded">
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n}>{n}</option>
        ))}
      </select>
    </div>
  );
}

function FoodPrep({ label, prepOptions }: any) {
  return (
    <div className="space-y-2">
      <Checkbox label={label} />
      <Qty5Select label={`${label} Qty (Pieces)`} />
      <Select label="Type of Preparation" options={prepOptions} />
      <TextArea label="Starters" />
      <Frequency label="Frequency" />
    </div>
  );
}

function Frequency({ label, extra = [] }: any) {
  return (
    <div className="space-y-2">
      <Checkbox label={label} />
      <Select
        label="Frequency"
        options={["Daily", "Weekly", "Monthly", ...extra]}
      />
    </div>
  );
}

function SweetQty({ label }: any) {
  return (
    <div>
      <Checkbox label={label} />
      <Select
        label="Qty (TSP/TBSP)"
        options={["1", "2", "3", "4", "5", "6", "8", "9", "10"]}
      />
      <Frequency label="Frequency" />
    </div>
  );
}

function DrinkQty({ label }: any) {
  return (
    <div>
      <Checkbox label={label} />
      <Select
        label="Qty (cups/pieces)"
        options={["1", "2", "3", "4", "5", "6", "8", "9", "10"]}
      />
      <Frequency label="Frequency" />
    </div>
  );
}

function AlcoholQty({ label }: any) {
  return (
    <div className="space-y-2">
      <Checkbox label={label} />
      <TextArea label="Quantity (ml)" />
      <Frequency label="Frequency" />
    </div>
  );
}
