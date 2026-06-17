import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLogin, useSignup } from "../hooks/useAuth";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

const labelStyle =
  "block sm:text-sm text-xs font-semibold text-gray-200 tracking-wide mb-1";

const inputStyle =
  "w-full p-2 font-semibold rounded-lg bg-white/10 border border-white/20 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm";

const buttonPrimary =
  "w-full p-2 cursor-pointer rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold tracking-wide transition-all duration-200";

const linkStyle = "text-sm text-gray-300 hover:text-white cursor-pointer ";
const activeLinkStyle =
  "text-white underline cursor-pointer font-semibold cursor-pointer";

const cardStyle =
  "w-md rounded-xl bg-white/5 border border-white/10 p-4 shadow-sm transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] hover:border-blue-500/50 cursor-pointer";

function SignIn({ register, errors }) {
  return (
    <>
      <label htmlFor="username" className={labelStyle}>
        USERNAME
      </label>
      <input
        type="text"
        autoComplete="on"
        id="username"
        name="username"
        placeholder="KING"
        {...register("username", {
          required: "Username is required",
          minLength: { value: 3, message: "Username is too short" },
        })}
        className={inputStyle}
      />
      {errors?.username && (
        <p className="text-amber-500 text-xs">{errors?.username?.message}</p>
      )}

      <label htmlFor="email" className={labelStyle}>
        EMAIL
      </label>
      <input
        type="email"
        id="email"
        name="email"
        autoComplete="on"
        placeholder="xxx@mn.com"
        {...register("email", {
          required: "Email is required",
          pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email format" },
        })}
        className={inputStyle}
      />
      {errors?.email && (
        <p className="text-amber-500 text-xs">{errors.email.message}</p>
      )}
    </>
  );
}

function LogIn({ register, errors }) {
  return (
    <>
      <label htmlFor="email" className={labelStyle}>
        EMAIL
      </label>
      <input
        type="email"
        id="email"
        name="email"
        autoComplete="on"
        placeholder="xxx@mn.com"
        {...register("email", {
          required: "Email is required",
          pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email format" },
        })}
        className={inputStyle}
      />
      {errors?.email && (
        <p className="text-amber-500 text-xs">{errors.email.message}</p>
      )}
    </>
  );
}

function Form() {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors,
  } = useForm();

  const {
    mutate: signupMutate,
    isPending: signupLoading,
    error: signupError,
    reset: signupReset,
  } = useSignup({
    onSuccess: () => {
      toast.success("Account created successfully!");
    },
    onError: (err) => {
      toast.error(err?.message || "Signup failed");
    },
  });

  const {
    mutate: loginMutate,
    isLoading: loginLoading,
    isError: loginError,
    isSuccess: loginSuccess,
    reset: loginReset,
  } = useLogin({
    onSuccess: () => {
      toast.success("Welcome back!");
    },
    onError: (err) => {
      toast.error(err?.message || "Invalid credentials");
    },
  });

  const onSubmit = (data) => {
    if (showLogin) {
      loginMutate(data);
    } else {
      signupMutate(data);
    }
  };

  const toggleAuthMode = () => {
    reset();
    clearErrors();
    loginReset();
    signupReset();
    setShowLogin((prev) => !prev);
  };

  return (
    <div className={cardStyle}>
      <div className="flex gap-7">
        <button
          type="button"
          className={!showLogin ? activeLinkStyle : linkStyle}
          onClick={toggleAuthMode}
        >
          SIGN IN
        </button>
        <button
          type="button"
          className={showLogin ? activeLinkStyle : linkStyle}
          onClick={toggleAuthMode}
        >
          LOG IN
        </button>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="on"
        className="flex flex-col items-center justify-between gap-2 break-all"
      >
        {showLogin ? (
          <LogIn register={register} errors={errors} />
        ) : (
          <SignIn register={register} errors={errors} />
        )}

        {(loginError || signupError) && (
          <p className="text-amber-600 text-xs w-full wrap-break-word text-center">
            {loginError?.message ||
              signupError?.message ||
              "Authentication failed"}
          </p>
        )}

        {(showLogin ? loginLoading : signupLoading) && (
          <p className="text-blue-300 text-xs mt-2">Submitting...</p>
        )}

        <p className="text-center text-amber-300 mt-4">
          {showLogin ? "Don't have an account? " : "Already have an account? "}
        </p>

        <button
          type="button"
          className={`${linkStyle} ${activeLinkStyle}`}
          onClick={toggleAuthMode}
        >
          {showLogin ? "Sign Up" : "Log In"}
        </button>

        <button type="submit" className={buttonPrimary}>
          {showLogin ? "LOG IN" : "SIGN IN"}
        </button>
      </form>
    </div>
  );
}

export default Form;
