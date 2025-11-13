import { useRouter } from "next/router";
import type { Page as PageType } from "src/types/page";

const Page: PageType = () => {
  const router = useRouter();
  const { url } = router.query;

  return (
    <video
      loop
      muted
      autoPlay
      style={{ width: 932, height: 585, objectFit: "fill" }}
      ref={(videoRef) => {
        if (videoRef) {
          videoRef.currentTime = 0;
        }
      }}
    >
      <source src={url.toString()} type="video/mp4" />
    </video>
  );
};

export default Page;
