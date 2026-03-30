import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const profiles = [
  { id: 1, img: "/images/jet.jpg", name: "Alice" },
  { id: 2, img: "/images/jet.jpg", name: "Bob" },
  { id: 3, img: "/images/jet.jpg", name: "Charlie" },
  { id: 4, img: "/images/jet.jpg", name: "Diana" },
  { id: 5, img: "/images/jet.jpg", name: "Eve" },
];

function ProfileSlider({ onProfileClick }) {
  return (
    <Swiper
      modules={[Pagination, Autoplay]}
      spaceBetween={16}
      slidesPerView={3}
      pagination={{ clickable: true }}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      loop={false}
      breakpoints={{
        1024: { slidesPerView: 4 },
        768: { slidesPerView: 3 },
        480: { slidesPerView: 3 },
      }}
    >
      {profiles.map((profile) => (
        <SwiperSlide key={profile.id}>
          <div
            className="flex flex-col items-center gap-2  p-3 cursor-pointer   "
            onClick={() => onProfileClick?.(profile)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onProfileClick?.(profile);
              }
            }}
          >
            <img
              src={profile.img}
              alt={profile.name}
              className="min-w-15 max-w-15 min-h-15 rounded-full  object-cover ring-green-600 ring-2  ring-offset-2"
              loading="lazy"
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
export default ProfileSlider;
