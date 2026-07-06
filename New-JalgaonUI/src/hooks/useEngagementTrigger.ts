"use client";

import { useEffect, useContext, useRef } from "react";
import { usePathname } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { SNOOZE_KEY, NEVER_KEY } from "@/lib/engagementStorage";

// Let's use 10 seconds for easy localhost testing. You can change this to 90000 (90s) for production.
const TRIGGER_TIME_MS = 10000;       
const TRIGGER_PAGE_VIEWS = 2;        // min 2 pages visited
const PAGE_VIEW_KEY = "auth_nudge_pv";

// Routes where we never show the popup
const EXCLUDED_ROUTES = ["/admin", "/account", "/add-listing", "/add-event", "/add-job"];

export function useEngagementTrigger() {
  const { isLogin, setIsLoginFormOpen, setEngagementTriggered } = useContext(AuthContext);
  const pathname = usePathname();
  const lastPathname = useRef<string | null>(null);

  // 1. Track page views safely on actual pathname changes
  useEffect(() => {
    if (isLogin) {
      console.log("[Auth Nudge] User is logged in. Resetting page view tracking.");
      sessionStorage.removeItem(PAGE_VIEW_KEY);
      return;
    }

    if (EXCLUDED_ROUTES.some((r) => pathname.startsWith(r))) {
      console.log(`[Auth Nudge] Current path ${pathname} is excluded from tracking.`);
      return;
    }

    if (lastPathname.current !== pathname) {
      lastPathname.current = pathname;
      const currentPV = parseInt(sessionStorage.getItem(PAGE_VIEW_KEY) || "0", 10) + 1;
      sessionStorage.setItem(PAGE_VIEW_KEY, String(currentPV));
      console.log(`[Auth Nudge] Page view recorded. Total views this session: ${currentPV}`);
    }
  }, [pathname, isLogin]);

  // 2. Manage the trigger timer
  useEffect(() => {
    // Guard 1: Logged in
    if (isLogin) {
      return;
    }

    // Guard 2: Excluded page
    if (EXCLUDED_ROUTES.some((r) => pathname.startsWith(r))) {
      return;
    }

    // Guard 3: Blocked / Never Show option selected
    if (localStorage.getItem(NEVER_KEY) === "true") {
      console.log("[Auth Nudge] Popup is permanently disabled ('Don't show again' is active).");
      return;
    }

    // Guard 4: Snoozed
    const snoozeUntil = localStorage.getItem(SNOOZE_KEY);
    if (snoozeUntil && Date.now() < parseInt(snoozeUntil, 10)) {
      const remainingMinutes = Math.round((parseInt(snoozeUntil, 10) - Date.now()) / 60000);
      console.log(`[Auth Nudge] Popup is snoozed. Remaining snooze time: ${remainingMinutes} minutes.`);
      return;
    }

    // Guard 5: Page view check
    const currentPV = parseInt(sessionStorage.getItem(PAGE_VIEW_KEY) || "0", 10);
    if (currentPV < TRIGGER_PAGE_VIEWS) {
      console.log(`[Auth Nudge] Waiting for more page views. Current: ${currentPV}/${TRIGGER_PAGE_VIEWS}`);
      return;
    }

    // Start trigger timer
    console.log(`[Auth Nudge] Conditions met! Starting a ${TRIGGER_TIME_MS / 1000}s timer...`);
    const timer = setTimeout(() => {
      console.log("[Auth Nudge] Timer finished! Launching login/signup modal.");
      setEngagementTriggered(true);
      setIsLoginFormOpen(true);
    }, TRIGGER_TIME_MS);

    return () => {
      console.log("[Auth Nudge] Path change or re-evaluation: Clearing active timer.");
      clearTimeout(timer);
    };
  }, [pathname, isLogin, setIsLoginFormOpen, setEngagementTriggered]);
}
