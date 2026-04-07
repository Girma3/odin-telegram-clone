import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useGetCurrentUser, useLogin, useSignup } from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
const labelStyle =
  "block sm:text-sm text-xs font-semibold text-gray-200 tracking-wide mb-1";

const inputStyle =
  "w-full px-4 sm:py-3 rounded-lg bg-white/10 border border-white/20 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm";

const buttonPrimary =
  "w-full sm:py-2 cursor-pointer rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold tracking-wide transition-all duration-200";

const linkStyle = "text-sm text-gray-300 hover:text-white cursor-pointer ";
const activeLinkStyle =
  "text-white underline cursor-pointer font-semibold cursor-pointer";
const cardStyle =
  "rounded-xl bg-white/5 border border-white/10 p-4 shadow-sm transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] hover:border-blue-500/50 cursor-pointer";

function SignIn({ register, errors }) {
  return (
    <>
      <label htmlFor="name" className={labelStyle}>
        USERNAME
      </label>
      <input
        type="text"
        id="name"
        placeholder="KING"
        {...register("name", {
          required: "Name is required",
          minLength: { value: 2, message: "Name is too short" },
        })}
        className={inputStyle}
      />
      {errors.name && (
        <p className="text-amber-500 text-xs">{errors.name.message}</p>
      )}

      <label htmlFor="email" className={labelStyle}>
        EMAIL
      </label>
      <input
        type="email"
        id="email"
        placeholder="xxx@mn.com"
        {...register("email", {
          required: "Email is required",
          pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email format" },
        })}
        className={inputStyle}
      />
      {errors.email && (
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
        placeholder="xxx@mn.com"
        {...register("email", {
          required: "Email is required",
          pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email format" },
        })}
        className={inputStyle}
      />
      {errors.email && (
        <p className="text-amber-500 text-xs">{errors.email.message}</p>
      )}
    </>
  );
}

function Form() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState, reset, clearErrors } = useForm();
  const { errors } = formState;
  const [showLogin, setShowLogin] = useState(true);
  //check if we had data
  const { data: user, isLoading } = useGetCurrentUser();
  //fetch rather than calling backend

  useEffect(() => {
    if (user && !isLoading) {
      navigate("/", { replace: true });
    }
  }, [user, navigate, isLoading]);

  const {
    mutate: signupMutate,
    isLoading: signupLoading,
    isError: signupError,
    error: signupErrorMessage,
    reset: signupReset,
  } = useSignup({
    onSuccess: () => {
      navigate("/");
    },
  });

  const {
    mutate: loginMutate,
    isLoading: loginLoading,
    isError: loginError,
    error: loginErrorMessage,
    reset: loginReset,
  } = useLogin({
    onSuccess: () => {
      navigate("/");
    },
  });

  const onSubmit = (data) => {
    if (showLogin) {
      loginMutate(data);
    } else {
      signupMutate(data);
    }
  };

  return (
    <div className={cardStyle}>
      <div className="flex gap-7">
        <button
          type="button"
          className={!showLogin ? activeLinkStyle : linkStyle}
          onClick={() => {
            reset();
            clearErrors();
            loginReset();
            signupReset();
            setShowLogin(() => !showLogin);
          }}
        >
          SIGN IN
        </button>
        <button
          type="button"
          className={showLogin ? activeLinkStyle : linkStyle}
          onClick={() => {
            reset();
            clearErrors();
            loginReset();
            signupReset();
            setShowLogin(() => !showLogin);
          }}
        >
          LOG IN
        </button>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center justify-between gap-2 break-all   "
      >
        {showLogin ? (
          <LogIn register={register} errors={loginError} />
        ) : (
          <SignIn register={register} errors={signupError} />
        )}

        {(loginError || signupError) && (
          <p className="text-amber-600 text-xs mt-2">
            {(loginErrorMessage || signupErrorMessage)?.message ||
              "Authentication failed"}
          </p>
        )}

        {(showLogin ? loginLoading : signupLoading) && (
          <p className="text-blue-300 text-xs mt-2">Submitting...</p>
        )}

        {showLogin ? (
          <>
            <p className="text-center text-amber-300">
              Don't have an account?{" "}
            </p>
            <button
              className={`${linkStyle} ${activeLinkStyle} `} //linkStyle}
              onClick={() => {
                reset();
                clearErrors();
                loginReset();
                signupReset();
                setShowLogin(() => !showLogin);
              }}
            >
              Sign Up
            </button>
          </>
        ) : (
          <>
            <p className="text-center text-amber-300">
              Already have an account?{" "}
            </p>
            <button
              className={`${linkStyle} ${activeLinkStyle} `} //linkStyle}
              onClick={() => {
                reset();
                clearErrors();
                loginReset();
                signupReset();
                setShowLogin(() => !showLogin);
              }}
            >
              Log In
            </button>
          </>
        )}

        <button type="submit" className={buttonPrimary}>
          {!showLogin ? "SIGN IN" : "LOG IN"}
        </button>
      </form>
    </div>
  );
}

export default Form;
