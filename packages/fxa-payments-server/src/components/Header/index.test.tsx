import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import Header from './index';

const userProfile = {
  avatar: './avatar.svg',
  displayName: 'Foxy77',
  email: 'foxy@firefox.com',
  amrValues: ['amrval'],
  avatarDefault: true,
  locale: 'en-US',
  twoFactorAuthentication: false,
  uid: 'UIDSTRINGHERE',
};

afterEach(cleanup);

describe('Header', () => {
  const subject = () => {
    return render(<Header {...{ profile: userProfile }} />);
  };

  const { queryByTestId, getByText } = subject();

  it('renders as expected', () => {
    const branding = getByText('Firefox');
    expect(branding).toHaveClass('fxa-account-title');

    const avatar = queryByTestId('avatar');
    expect(avatar).toHaveAttribute('alt', userProfile.displayName);
  });
});
