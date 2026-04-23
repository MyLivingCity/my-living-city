import React, { useState } from "react";
import { USER_TYPES } from "@lib/constants";

type PlanConfig = {
  header: string;
  price: number;
  features: string[];
  buttonLabel: string;
  type: string;
};

type PlanProps = PlanConfig & {
  isSelected: boolean;
  onClickHandler: (type: string) => void;
};

const PLAN_CONFIGS: PlanConfig[] = [
  {
    header: "Standard",
    price: 0,
    features: [
      "Submit ideas",
      "Rate ideas",
      "Submit proposals",
      "Access to the community",
    ],
    buttonLabel: "Sign up for free",
    type: USER_TYPES.RESIDENTIAL,
  },
  {
    header: "Community",
    price: 50,
    features: [
      "Community organizations and nonprofits",
      "Rate ideas",
      "Submit proposals",
    ],
    buttonLabel: "Get started",
    type: USER_TYPES.COMMUNITY,
  },
  {
    header: "Business",
    price: 100,
    features: [
      "Businesses to engage with the community",
      "Rate ideas",
      "Submit proposals",
    ],
    buttonLabel: "Join now",
    type: USER_TYPES.BUSINESS,
  },
];

const Plan: React.FC<PlanProps> = ({
  header,
  price,
  features,
  isSelected,
  type,
  onClickHandler,
}) => (
  <div
    className={`card shadow-sm ${isSelected ? "m-2" : "m-4"}`}
    onClick={() => onClickHandler(type)}
  >
    <div className={`card-header opacity-50 ${isSelected ? "bg-primary" : ""}`}>
      <h4
        className={`my-0 font-weight-normal ${isSelected ? "text-white" : ""}`}
      >
        {header}
      </h4>
    </div>
    <div className="card-body">
      <h1 className="card-title pricing-card-title">
        {`$${price}`}
        <small className="text-muted">/ yr</small>
      </h1>
      <ul className="list-unstyled mt-3 mb-4">
        {features.map((feature, i) => (
          <li key={i}>{feature}</li>
        ))}
      </ul>
    </div>
  </div>
);

type PricingPlanSelectorProps = {
  onClickParam: (type: string) => void;
};

const PricingPlanSelector: React.FC<PricingPlanSelectorProps> = ({
  onClickParam,
}) => {
  const [selected, setSelected] = useState<string>(USER_TYPES.RESIDENTIAL);

  const handleSelect = (type: string) => {
    onClickParam(type);
    setSelected(type);
  };

  return (
    <div className="card-deck mb-3 text-center">
      {PLAN_CONFIGS.map((plan) => (
        <Plan
          key={plan.header}
          {...plan}
          isSelected={selected === plan.type}
          onClickHandler={handleSelect}
        />
      ))}
    </div>
  );
};

export default PricingPlanSelector;
