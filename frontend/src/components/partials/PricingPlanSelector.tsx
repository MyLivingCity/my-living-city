import React, { useState } from 'react';
import { USER_TYPES } from 'src/lib/constants';

const PricingPlanSelector: React.FC<any> = (params) => {
  const [selected, setSelected] = useState(USER_TYPES.RESIDENTIAL)
  const planContents = [
    {
      header: 'Standard',
      price: 0,
      features: [
        'Submit ideas',
        'Rate ideas',
        'Submit proposals',
        'Access to the community',
      ],
      buttonLabel: 'Sign up for free',
      outline: selected !== USER_TYPES.RESIDENTIAL,
      type: USER_TYPES.RESIDENTIAL
    },
    {
      header: 'Community',
      price: 50,
      features: [
        'Community organizations and nonprofits',
        'Rate ideas',
        'Submit proposals',
      ],
      buttonLabel: 'Get started',
      outline: selected !== USER_TYPES.COMMUNITY,
      type: USER_TYPES.COMMUNITY
    },
    {
      header: 'Business',
      price: 100,
      features: [
          'Businesses to engage with the community',
          'Rate ideas',
          'Submit proposals',
        ],
        buttonLabel: 'Join now',
        outline: selected !== USER_TYPES.BUSINESS,
        type: USER_TYPES.BUSINESS,
    },
  ];


  const callParamOnClickAndSetSelect = (type:any) => {
    params.onClickParam(type)
    setSelected(type)
  }

  const Plan = (props: any) => {
    return (
      <div className={`card shadow-sm ${props.outline ? 'm-4':'m-2'} `} onClick={() => {props.onClickHandler(props.type)}}>
        <div className={`card-header opacity-50 ${props.outline ? '':'bg-primary'}`} >
          <h4 className={`my-0 font-weight-normal ${props.outline ? '':'text-white'}`}>{props.header}</h4>
        </div>
        <div className="card-body">
          <h1 className="card-title pricing-card-title">
            {`$${props.price}`}
            <small className="text-muted">/ yr</small>
          </h1>
          <ul className="list-unstyled mt-3 mb-4">
            {props.features.map((feature: any, i: any) => (
              <li key={i}>{feature}</li>
            ))}
          </ul>
          
        </div>
      </div>
    );
  };

  return (
    <div className="card-deck mb-3 text-center">
      {planContents.map((obj, i) => {
        return (
          <Plan
            key={obj.header}
            header={obj.header}
            price={obj.price}
            features={obj.features}
            buttonLabel={obj.buttonLabel}
            outline={obj.outline}
            type={obj.type}
            onClickHandler={callParamOnClickAndSetSelect}
          />
        );
      })}
    </div>
  );
}

export default PricingPlanSelector;