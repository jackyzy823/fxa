import React, { useState } from 'react';
import { Localized } from 'fluent-react';
import { formatCurrencyInCents } from '../../lib/formats';

import './index.scss';
import { Plan, Profile } from '../../store/types';

type PlanDetailsProps = {
  profile: Profile;
  plan: Plan;
  showExpandButton: boolean;
  className?: string;
};

export const PlanDetails = ({
  profile,
  plan,
  showExpandButton,
  className = 'default',
}: PlanDetailsProps) => {
  const initialDetailsHiddenState = showExpandButton ? true : false;
  const [detailsHidden, setDetailsState] = useState(initialDetailsHiddenState);
  const { displayName, email } = profile;
  const {
    // plan_id: string;
    plan_name,
    plan_metadata,
    // product_id: string;
    product_name,
    product_metadata,
    currency,
    amount,
    interval,
  } = plan;

  // const iconURL = product_metadata ? product_metadata.webIconURL : 'none.jpg';

  console.log('PROFILE', profile);
  console.log('PLAN', plan);

  const up = <span className="up-chevron">&rsaquo;</span>;
  const down = <span className="down-chevron">&rsaquo;</span>;

  return (
    <section className="container card plan-details-component">
      <header>
        <div className="plan-details-header-wrap">
          <img
            src={'/static/media/firefox-logo.16821f55.svg'}
            alt={product_name}
          />
          <div className="plan-details-heading-wrap">
            <p className="plan-details-product">{product_name}</p>
            <p className="plan-details-description">Full-device VPN</p>
          </div>
        </div>
        <p>
          ${formatCurrencyInCents(amount)}/{interval}
        </p>
      </header>
      {!detailsHidden ? (
        <section className="plan-details-list" aria-expanded={!detailsHidden}>
          <Localized id="plan-details-header">
            <h4>Product details</h4>
          </Localized>
          <ul>
            <li>something abt the product</li>
            <li>something abt the product</li>
            <li>something abt the product</li>
            <li>something abt the product</li>
            {/* unordered list generated
            over a loop with each description details
          */}
          </ul>
        </section>
      ) : null}
      {showExpandButton ? (
        <section className="footer">
          {detailsHidden ? (
            <Localized id="plan-details-show-button" span={down}>
              <p
                className="btn down-arrow"
                onClick={() => setDetailsState(false)}
              >
                Show details
              </p>
            </Localized>
          ) : (
            <Localized id="plan-details-hide-button" span={up}>
              <p className="btn up-arrow" onClick={() => setDetailsState(true)}>
                Hide details
              </p>
            </Localized>
          )}
        </section>
      ) : null}
    </section>
  );
};

export default PlanDetails;
