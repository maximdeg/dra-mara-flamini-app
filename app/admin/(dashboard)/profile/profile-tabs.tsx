"use client";

import { Tabs } from "@/components/ui/tabs";
import { ChangePasswordForm } from "./change-password-form";
import { ProfileForm } from "./profile-form";

/** Groups the profile and password forms under one tab group. */
export function ProfileTabs(props: {
  email: string;
  name: string;
  phone: string;
  whatsappNumber: string;
}) {
  return (
    <Tabs
      tabs={[
        { id: "datos", label: "Datos", content: <ProfileForm {...props} /> },
        {
          id: "password",
          label: "Contraseña",
          content: <ChangePasswordForm />,
        },
      ]}
    />
  );
}
