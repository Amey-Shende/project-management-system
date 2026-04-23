"use client"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Controller, useForm } from "react-hook-form"
import { loginSchema } from "@/validations/authscehma"
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod"
import { Suspense, useEffect, useState } from "react"
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import api from "@/lib/axios"
import Loader from "@/components/Loader"
import dynamischVerticalLogo from "../../../../public/dynamisch-vertical-logo.svg";
import Image from "next/image"

type LoginFormValues = z.infer<typeof loginSchema>

// Separate component that uses useSearchParams
function LoginContent() {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)
    const router = useRouter();
    const searchParams = useSearchParams();

    // Check for session expiration on mount
    useEffect(() => {
        // Only show "session expired" toast if user was previously logged in
        const wasLoggedIn = localStorage.getItem("isLoggedIn") === "true";

        if (searchParams.get("session_expired") === "true" && wasLoggedIn) {
            toast.error("Session expired. Please log in again.", {
                position: "top-right",
            });
            // Clean up localStorage
            localStorage.removeItem("user");
            localStorage.removeItem("isLoggedIn");
        }

        // Clean up URL parameter
        if (searchParams.get("session_expired") === "true") {
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete("session_expired");
            router.replace("/login");
        }
    }, [searchParams, router]);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const { handleSubmit } = form

    async function onSubmit(data: LoginFormValues) {
        try {
            const response = await api.post("/auth/login", data);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            localStorage.setItem("isLoggedIn", "true"); // Track login state
            router.push("/dashboard");
            setTimeout(() => {
                toast.success("Login successfully", {
                    position: "top-right",
                    classNames: {
                        content: "flex flex-col gap-2",
                    },

                });
            }, 500);

        } catch (error) {
            const message = error instanceof Error
                ? error.message
                : "Login failed. Please check your credentials and try again.";

            toast.error(message, {
                position: "top-right",
                classNames: {
                    content: "flex flex-col gap-2",
                },
            });
            console.error("Login error:", error);
        }

    }

    const handleNavigate = () => {
        router.push("/forgot-password");
    };

    return (
        <main className="relative min-h-screen overflow-hidden">
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
                        <CardHeader className="space-y-1 text-center">
                            <Image
                                alt="dynmisch login logo"
                                src={dynamischVerticalLogo}
                                height={60}
                                className="mx-auto"
                            />
                            {/* <CardTitle className="text-2xl">Login</CardTitle> */}
                        </CardHeader>
                        <CardContent>
                            <form id="form-rhf-demo" onSubmit={handleSubmit(onSubmit)} noValidate>
                                <FieldGroup className="gap-5">
                                    <Controller
                                        name="email"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor="email">
                                                    Email
                                                </FieldLabel>
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
                                                        autoComplete="current-password"
                                                        aria-invalid={fieldState.invalid}
                                                        className="h-10  pr-10 pl-10"
                                                    />
                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2">
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
                                    <span className="flex justify-end -mt-3.75 cursor-pointer text-sm text-blue-600"
                                        onClick={handleNavigate}>
                                        Forgot password?
                                    </span>
                                </FieldGroup>
                            </form>
                        </CardContent>
                        <CardFooter className="w-full mb-3">
                            <Button type="submit" form="form-rhf-demo" size={"lg"} className="w-full">
                                Log In
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </main>
    )
}

// Main component with Suspense boundary
export default function Login() {
    return (
        <Suspense fallback={<Loader />}>
            <LoginContent />
        </Suspense>
    )
}
