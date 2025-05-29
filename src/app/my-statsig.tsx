'use client';

import React from "react";
import { StatsigProvider, useClientAsyncInit } from '@statsig/react-bindings';
import { StatsigAutoCapturePlugin } from '@statsig/web-analytics';


export default function MyStatsig({ children }: { children: React.ReactNode }) {
  const { client } = useClientAsyncInit(
    "client-Mq8Vj4F8GYequQZ7i4bSzeeEyyTd9gUVpwHUizHRaF2",
    { userID: 'a-user' }, 
    { plugins: [ new StatsigAutoCapturePlugin() ] },
  );

  return (
    <StatsigProvider client={client} loadingComponent={<div>Loading...</div>}>
      {children}
    </StatsigProvider>
  );
} 