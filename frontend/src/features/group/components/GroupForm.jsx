const formLabelStyle = `font-semibold text-md text-amber-200 tracking-wide `;

const inputStyle = `w-full  px-4 sm:py-2 rounded-lg bg-white/10 border border-white/20 text-gray-100
   placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
   focus:border-transparent backdrop-blur-sm`;
function GroupForm({ onSubmit, register, errors, handleSubmit, isSubmitting = false }) {
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 p-2">
      <label htmlFor="name" className={formLabelStyle}>
        Group Name
      </label>
      <input
        type="text"
        id="name"
        name="name"
        className={inputStyle}
        {...register(
          "name",

          {
            required: "Group name is required",
            minLength: { value: 2, message: "Group name is too short" },
            maxLength: { value: 50, message: "Group name is too long" },
          },
        )}
      />
      {errors.name && (
        <p className="text-amber-500 text-xs">{errors.name.message}</p>
      )}
      <label htmlFor="bio" className={formLabelStyle}>
        Description
      </label>
      <input
        type="text"
        id="bio"
        name="bio"
        className={inputStyle}
        {...register(
          "bio",

          {
            required: "Description is required",
            minLength: { value: 2, message: "Description is too short" },
            maxLength: { value: 100, message: "Description is too long" },
          },
        )}
      />

      {errors.bio && (
        <p className="text-amber-500 text-xs">{errors.bio.message}</p>
      )}

      <label htmlFor="website" className={formLabelStyle}>
        Website
      </label>
      <input
        type="text"
        id="website"
        name="website"
        className={inputStyle}
        {...register("website", {
          minLength: { value: 2, message: "Website is too short" },
          maxLength: { value: 50, message: "Website is too long" },
        })}
      />
      {errors.website && (
        <p className="text-amber-500 text-xs">{errors.website.message}</p>
      )}
      <button 
        type="submit" 
        disabled={isSubmitting}
        className={`w-full rounded-sm py-2 font-medium transition-all ${isSubmitting 
          ? 'bg-pink-600/50 cursor-not-allowed' 
          : 'bg-pink-600 hover:bg-pink-500'}
        `}
      >
        {isSubmitting ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}

export default GroupForm;
