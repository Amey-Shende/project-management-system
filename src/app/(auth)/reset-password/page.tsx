"use client"
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";
import { resetPasswordSchema } from "@/validations/authscehma";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon, LockIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";


type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

function ResetPassword() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isCnfPasswordVisible, setIsCnfPasswordVisible] = useState(false);

    const form = useForm<ResetPasswordForm>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: ""
        }
    });

    const { handleSubmit } = form

    async function onSubmit(data: ResetPasswordForm) {
        const payload = {
            email: searchParams?.get("email"),
            token: searchParams?.get("token"),
            password: data.password,
            confirmPassword: data.confirmPassword
        }
        // console.log(payload);
        try {
            const response = await api.post("/auth/reset-password", payload);
            if (response.status !== 200) {
                throw new Error("Failed to reset password");
            }
            toast.success("Password reset successfully. Please login with your new password.", {
                position: "top-right",
                classNames: {
                    content: "flex flex-col gap-2",
                },
            });

            router.replace("/login");
        } catch (error) {
            console.error("Failed to reset password:", error);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
            <div className="w-full max-w-md">
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader className="space-y-2 text-center">
                        <CardTitle className="text-2xl">Reset Password</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form id="form-rhf-demo" onSubmit={handleSubmit(onSubmit)} noValidate>
                            <FieldGroup className="gap-5">
                                <Controller
                                    name="password"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid} className="relative">
                                            <FieldLabel htmlFor="password">
                                                Password
                                            </FieldLabel>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                    <LockIcon className="h-4 w-4" />
                                                </span>
                                                <Input
                                                    {...field}
                                                    id="password"
                                                    type={isPasswordVisible ? "text" : "password"}
                                                    placeholder="Enter your password"
                                                    aria-invalid={fieldState.invalid}
                                                    className="h-10 pr-10 pl-10"
                                                />
                                                <span className="absolute right-2 top-1">
                                                    {
                                                        isPasswordVisible ? (
                                                            <Button variant="ghost" size="icon" onClick={() => setIsPasswordVisible(false)} type="button" className="active:bg-transparent hover:bg-transparent">
                                                                <EyeIcon />
                                                            </Button>
                                                        ) : (
                                                            <Button variant="ghost" size="icon" onClick={() => setIsPasswordVisible(true)} type="button" className="active:bg-transparent hover:bg-transparent">
                                                                <EyeOffIcon />
                                                            </Button>
                                                        )
                                                    }
                                                </span>
                                            </div>
                                            <FieldError errors={[fieldState.error]} />
                                        </Field>
                                    )}
                                />
                                <Controller
                                    name="confirmPassword"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid} className="relative">
                                            <FieldLabel htmlFor="confirmPassword">
                                                Confirm Password
                                            </FieldLabel>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                    <LockIcon className="h-4 w-4" />
                                                </span>
                                                <Input
                                                    {...field}
                                                    id="confirmPassword"
                                                    type={isCnfPasswordVisible ? "text" : "password"}
                                                    placeholder="Enter your confirm password"
                                                    aria-invalid={fieldState.invalid}
                                                    className="h-10 pr-10 pl-10"
                                                />
                                                <span className="absolute right-2 top-1">
                                                    {
                                                        isCnfPasswordVisible ? (
                                                            <Button variant="ghost" size="icon" onClick={() => setIsCnfPasswordVisible(false)} type="button" className="active:bg-transparent hover:bg-transparent">
                                                                <EyeIcon />
                                                            </Button>
                                                        ) : (
                                                            <Button variant="ghost" size="icon" onClick={() => setIsCnfPasswordVisible(true)} type="button" className="active:bg-transparent hover:bg-transparent">
                                                                <EyeOffIcon />
                                                            </Button>
                                                        )
                                                    }
                                                </span>
                                            </div>
                                            <FieldError errors={[fieldState.error]} />
                                        </Field>
                                    )}
                                />
                            </FieldGroup>
                        </form>
                    </CardContent>
                    <CardFooter className="w-full">
                        <Button type="submit" form="form-rhf-demo" size={"lg"} className="w-full">
                            Submit
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </main >
    )
}


export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<Loader />}>
            <ResetPassword />
        </Suspense>
    );
}