"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Lock,
  Mail,
  Phone,
  Building,
  Briefcase,
  Calendar,
  Shield,
  CheckCircle,
} from "lucide-react";
import { generateColor } from "@/lib/utils";
import { ChangePasswordModal } from "./ChangePasswordModal";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  designation?: string | null;
  department?: string | null;
  phone?: string | null;
  skills?: any;
  manager?: {
    id: number;
    name: string;
    email: string;
  } | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface ProfileInfoProps {
  user: UserProfile;
}

export function ProfileInfo({ user }: ProfileInfoProps) {
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const avatarColor = generateColor(user.name);
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section>
      <div className="p-2.5 h-[calc(100vh-6rem)] flex flex-col gap-4 ">
        <Card className="pt-0! mt-0! bg-gradient-to-r from-orange-50 via-white to-amber-50">
          <div className="h-20 rounded-t-lg" />
          <CardContent className="relative ">
            <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl  border-2 border-white"
                style={{ backgroundColor: avatarColor }}
              >
                {initials}
              </div>
              <div className="flex-1 pt-2 md:pt-0">
                <h1 className="text-xl font-bold ">{user.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                    {user.role}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setChangePasswordOpen(true)}
                className="mt-2 md:mt-0"
              >
                <Lock className="mr-2 h-4 w-4" />
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 -mt-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Full Name
                  </p>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Role</p>
                  <p className="font-medium">{user.role}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {user.designation && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Designation
                    </p>
                    <p className="font-medium">{user.designation}</p>
                  </div>
                )}
                {user.department && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Department
                    </p>
                    <p className="font-medium">{user.department}</p>
                  </div>
                )}
              </div>
              {user.manager && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Manager</p>
                  <p className="font-medium">{user.manager.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.manager.email}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 -mt-5">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Email Address
                </p>
                <p className="font-medium">{user.email}</p>
              </div>
              {user.phone && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Phone Number
                  </p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills Card */}
          {user.skills &&
            Array.isArray(user.skills) &&
            user.skills.length > 0 && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="-mt-5">
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill: any, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-secondary rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Account Details Card */}
          <Card className="md:col-span-2 mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="-mt-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Account Created
                  </p>
                  <p className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Last Updated
                  </p>
                  <p className="font-medium">
                    {new Date(user.updatedAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    <CheckCircle className="h-3 w-3" />
                    Active
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <ChangePasswordModal
          open={changePasswordOpen}
          onOpenChange={setChangePasswordOpen}
        />
      </div>
    </section>
  );
}
