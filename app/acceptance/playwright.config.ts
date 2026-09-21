import { defineConfig, devices } from '@playwright/test'
export default defineConfig({testDir:'.',testMatch:'hosted.spec.ts',workers:1,retries:0,timeout:900000,fullyParallel:false,
 use:{baseURL:process.env.MASHUPS_STAGING_ORIGIN,trace:'off',video:'off',screenshot:'off'},
 projects:[{name:'hosted-two-browser-contexts',use:{...devices['Pixel 7']}}]})
