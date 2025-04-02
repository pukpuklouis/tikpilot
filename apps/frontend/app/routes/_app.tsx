import { Outlet } from "@remix-run/react";
import { MainLayout } from "~/components/layout/main-layout";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "TikPilot - AI Agent for Social Media" },
    { name: "description", content: "Control multiple social media accounts with AI automation" },
  ];
};

export default function AppLayout() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}
