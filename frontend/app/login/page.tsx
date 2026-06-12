"use client"

import { login } from "@/services/auth.service";
import Error from "next/error";
// import { error } from "console";
import { useState } from "react";

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleLogin = async () => {
        try {
            const result = await login({
                email,
                password,
            })

            localStorage.setItem(
                "tokenn",
                result.data.token
            )

            alert("Login berhasil");
        } catch (error) {
            console.error(error)
            alert("Login gagal")
        }
    }

    return (
    <div>
      <input
        type="email"
        placeholder="email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <button onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}