"use client"

import { SignIn } from "@clerk/react-router";

export default function SignInPage() {
    return (
        <div className="flex items-center justify-center min-h-screen py-20">
            <SignIn />
        </div>
    );
}