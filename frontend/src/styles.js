const ModalStyle = `fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4`;
const ImageHolderStyle = `w-20 h-20 sm:w-18 sm:h-18 rounded-full overflow-hidden 
  border-2 border-white/20 shadow-md cursor-pointer hover:scale-105 transition-all duration-300`;
const CloseButtonStyle = `absolute top-4 right-4
   text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm p-2
    rounded-full transition-all duration-200 cursor-pointer`;
const ModalImageStyle =
  "max-w-full max-h-[85vh] rounded-xl shadow-2xl transition-transform duration-300";
const ProfileCardStyle = `relative rounded-2xl p-6 bg-white/5 border border-white/10 
  backdrop-blur-md shadow-lg transition-all duration-300 cursor-pointer
   hover:shadow-[0_0_35px_rgba(59,130,246,0.45)]
   hover:border-blue-500/40 `;

export {
  ModalStyle,
  ImageHolderStyle,
  CloseButtonStyle,
  ModalImageStyle,
  ProfileCardStyle,
};
