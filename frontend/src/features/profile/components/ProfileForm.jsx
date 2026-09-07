import { useForm, FormProvider, useFormContext } from "react-hook-form";

const FORM_LABEL_STYLE = `font-semibold text-md text-amber-200 tracking-wide`;
const INPUT_STYLE = `w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-amber-100 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-colors`;
const ERROR_STYLE = `text-red-400 text-xs mt-1 ml-1`;

// Form field component with validation
function FormField({
  name,
  label,
  type = "text",
  placeholder,
  validation,
  as = "input",
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const inputProps = {
    ...register(name, validation),
    type,
    id: name,
    placeholder,
    autoComplete: "on",
    className: `${INPUT_STYLE} ${errors[name] ? "border-red-500/50 ring-red-500/50" : ""}`,
    "aria-invalid": !!errors[name],
  };

  const isTextarea = as === "textarea";

  return (
    <div className="w-full p-1">
      <label htmlFor={name} className={FORM_LABEL_STYLE}>
        {label}
      </label>
      {isTextarea ? (
        <textarea
          {...inputProps}
          rows={3}
          className={`${INPUT_STYLE} ${errors[name] ? "border-red-500/50" : ""} resize-none`}
        />
      ) : (
        <input {...inputProps} />
      )}
      {errors[name] && (
        <p className={ERROR_STYLE} role="alert">
          {errors[name].message}
        </p>
      )}
    </div>
  );
}

function ProfileForm({ onSubmit, user, methods }) {
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        autoComplete="on"
        noValidate
        className="flex flex-col gap-4 w-full"
      >
        <FormField
          name="username"
          label="Username"
          placeholder="Your username"
          validation={{
            required: "Username is required",
            minLength: {
              value: 3,
              message: "Username must be at least 3 characters",
            },
            maxLength: {
              value: 30,
              message: "Username must be less than 30 characters",
            },
          }}
        />

        <FormField
          name="bio"
          label="Bio"
          as="textarea"
          placeholder="Tell us about yourself..."
          validation={{
            maxLength: {
              value: 200,
              message: "Bio must be less than 200 characters",
            },
          }}
        />

        <FormField
          name="location"
          label="Location"
          placeholder="City, Country"
          validation={{
            maxLength: {
              value: 100,
              message: "Location must be less than 100 characters",
            },
          }}
        />

        <FormField
          name="website"
          label="Website"
          type="url"
          placeholder="https://yourwebsite.com"
          validation={{
            pattern: {
              value: /^https?:\/\/.+\..+$/,
              message: "Please enter a valid URL (e.g., https://example.com)",
            },
            maxLength: {
              value: 200,
              message: "URL must be less than 200 characters",
            },
          }}
        />

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          Save Profile
        </button>
      </form>
    </FormProvider>
  );
}

export default ProfileForm;
