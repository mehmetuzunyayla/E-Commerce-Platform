'use client';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '../features/store';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <MantineProvider>
        <Notifications position="top-right" />
        {children}
      </MantineProvider>
    </ReduxProvider>
  );
}
