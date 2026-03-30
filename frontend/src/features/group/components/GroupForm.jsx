const formLabelStyle = `font-semibold text-md text-amber-200 tracking-wide `;

const inputStyle = `w-full  px-4 sm:py-2 rounded-lg bg-white/10 border border-white/20 text-gray-100
   placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
   focus:border-transparent backdrop-blur-sm`;
function GroupForm({ onSubmit, register, errors, isEdit = false }) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 p-2">
      <label htmlFor="groupName" className={formLabelStyle}>
        Group Name
      </label>
      <input
        type="text"
        id="groupName"
        name="groupName"
        className={inputStyle}
        {...register(
          "groupName",
          { required: isEdit ? false : true },
          {
            minLength: { value: 2, message: "Group name is too short" },
            maxLength: { value: 50, message: "Group name is too long" },
          },
        )}
      />
      {errors.groupName && (
        <p className="text-red-500 text-xs">{errors.groupName.message}</p>
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
          { required: isEdit ? false : true },
          {
            minLength: { value: 2, message: "Description is too short" },
            maxLength: { value: 100, message: "Description is too long" },
          },
        )}
      />

      {errors.bio && (
        <p className="text-red-500 text-xs">{errors.bio.message}</p>
      )}

      <label htmlFor="website" className={formLabelStyle}>
        Website
      </label>
      <input
        type="text"
        id="website"
        name="website"
        className={inputStyle}
        {...register("userWebsite", {
          minLength: { value: 2, message: "Website is too short" },
          maxLength: { value: 50, message: "Website is too long" },
        })}
      />
      {errors.Website && (
        <P className="text-red-500 text-xs">{errors.Website.message}</P>
      )}
      <button type="submit" className="w-full bg-pink-600 rounded-sm py-2">
        Save
      </button>
    </form>
  );
}

export default GroupForm;
