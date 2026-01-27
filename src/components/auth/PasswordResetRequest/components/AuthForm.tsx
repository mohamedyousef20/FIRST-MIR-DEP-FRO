"use client"

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthFormProps {
  register: any;
  errors: any;
}

export const AuthForm = ({ register, errors }: AuthFormProps) => {
  return (
    <div>
      <Label htmlFor="email">البريد الإلكتروني</Label>
      <Input
        id="email"
        type="email"
        placeholder="أدخل بريدك الإلكتروني"
        {...register('email')}
      />
      {errors.email && (
        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
      )}
    </div>
  );
};
