"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Controller, useForm } from "react-hook-form";
import { loginSchema } from "@/validations/authscehma";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Suspense } from "react";
import Loader from "@/components/Loader";
import { MailIcon } from "lucide-react";
import Image from "next/image";
import dynamischVerticalLogo from "../../../../public/dynamisch-vertical-logo.svg";

const forgotPasswordSchema = loginSchema.pick({ email: true });

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword: React.FC = () => {
  const router = useRouter();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const { handleSubmit } = form;

  async function onSubmit(data: ForgotPasswordFormValues) {
    try {
      const response = await api.post("/auth/forgot-password", data);
      if (response.status !== 200) {
        throw new Error("Failed to send password reset link");
      }
      toast("Password reset link sent successfully", {
        position: "top-right",
        classNames: {
          content: "flex flex-col gap-2",
        },
      });
      router.push("/login");
    } catch (error) {
      console.error("Failed to send password reset link:", error);
    }
  }
  const handleNavigate = () => {
    router.push("/login");
  };

  return (
    <Suspense fallback={<Loader />}>
      <main className="relative min-h-screen overflow-hidden bg-black">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute h-full w-full object-cover"
        >
          <source src="/hero-background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/4" />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            <Card className="w-full max-w-md shadow-lg">
              <CardHeader className="space-y-2 text-center">
                <Image
                  alt="dynmisch login logo"
                  src={dynamischVerticalLogo}
                  height={60}
                  className="mx-auto"
                />
                <CardTitle className="text-xl">Forgot Password</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  id="form-rhf-demo"
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                >
                  <FieldGroup className="gap-5">
                    <Controller
                      name="email"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="email">Email</FieldLabel>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              <MailIcon className="h-4 w-4 mt-1" />
                            </span>
                            <Input
                              {...field}
                              id="email"
                              type="email"
                              placeholder="Enter your email"
                              autoComplete="email"
                              aria-invalid={fieldState.invalid}
                              className="h-10 pl-10"
                            />
                          </div>
                          <FieldError errors={[fieldState.error]} />
                        </Field>
                      )}
                    />
                  </FieldGroup>
                </form>
              </CardContent>
              <CardFooter className="w-full">
                <Button
                  type="submit"
                  form="form-rhf-demo"
                  size={"lg"}
                  className="w-full"
                >
                  Submit
                </Button>
              </CardFooter>
              <div className="flex justify-center ">
                <span
                  className="text-sm text-blue-500 flex justify-end cursor-pointer"
                  onClick={handleNavigate}
                >
                  Back to login
                </span>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </Suspense>
  );
};

export default ForgotPassword;
