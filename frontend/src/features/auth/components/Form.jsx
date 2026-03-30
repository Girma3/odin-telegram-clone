import { useState } from "react";
import { useForm } from "react-hook-form";
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

function SignIn({ register }) {
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
    </>
  );
}

function LogIn({ register }) {
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
    </>
  );
}

function Form() {
  const { register, handleSubmit, formState } = useForm();
  const { errors } = formState;

  const [showLogin, setShowLogin] = useState(true);

  function onSubmit(data) {
    console.log("FORM DATA:", data);
  }

  return (
    <div className={cardStyle}>
      <div className="flex gap-7">
        <button
          type="button"
          className={showLogin ? activeLinkStyle : linkStyle}
          onClick={() => setShowLogin(() => !showLogin)}
        >
          SIGN IN
        </button>
        <button
          type="button"
          className={!showLogin ? activeLinkStyle : linkStyle}
          onClick={() => setShowLogin(() => !showLogin)}
        >
          LOG IN
        </button>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center justify-between gap-2 break-all   "
      >
        {showLogin ? (
          <LogIn register={register} />
        ) : (
          <SignIn register={register} />
        )}
        {!showLogin ? (
          <>
            <p className="text-center text-amber-300">
              Don't have an account?{" "}
            </p>
            <button
              className={`${linkStyle} ${activeLinkStyle} `} //linkStyle}
              onClick={() => setShowLogin(() => !showLogin)}
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
              onClick={() => setShowLogin(() => !showLogin)}
            >
              Log In
            </button>
          </>
        )}

        <button type="submit" className={buttonPrimary}>
          {showLogin ? "SIGN IN" : "LOG IN"}
        </button>
      </form>
    </div>
  );
}

export default Form;
