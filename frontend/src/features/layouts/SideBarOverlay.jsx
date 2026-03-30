const imgStyle = `
  rounded-full  w-15 h-15 shadow-md ring-2 ring-green-400 ring-offset-2 object-cover
`;

const linkHolder = `
  flex flex-col items-start gap-2 p-2
`;
const primaryLink = `
  text-xs text-amber-100 p-2 hover:bg-white/5 rounded-md cursor-pointer
 
`;
const topHalf = `bg-gray-800 rounded-md w-full h-1/2 flex flex-col items-start justify-between gap-2 p-4

`;
function SideBarOverlay({
  onProfileOpen,
  onCreateGroup,

  hasGroup = true,
  onLogout,
}) {
  return (
    <div className="text-yellow-50 transition ease-in-out duration-300">
      <div className={topHalf}>
        <img
          src="/images/jet.jpg"
          alt="profile"
          className={imgStyle}
          loading="lazy"
        />
        <p>Name</p>
      </div>
      <div className={linkHolder}>
        <button
          className={primaryLink}
          onClick={() => onProfileOpen({ type: "user", id: 1 })}
        >
          Profile
        </button>
        {/* if user has group don't show create group */}
        {!hasGroup && (
          <button className={primaryLink} onClick={onCreateGroup}>
            +create Group
          </button>
        )}
        {hasGroup && (
          <button
            className={primaryLink}
            onClick={() => onProfileOpen({ type: "group", id: 1 })}
          >
            My Group Profile
          </button>
        )}
        <button className={primaryLink} onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default SideBarOverlay;
