import type { FC } from "react";
import Slider from "react-slick";
import { Box, useTheme } from "@mui/material";
import type { SxProps } from "@mui/system";

const sliderSettings = {
  arrows: false,
  dots: false,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
};

interface HyperlocalCarouselProps {
  sx?: SxProps;
  images: string[];
}

const HyperlocalCarousel: FC<HyperlocalCarouselProps> = (props) => {
  const { sx, images } = props;
  const theme = useTheme();

  return (
    <Box
      sx={{
        ...sx,
        "& .slick-slider": {
          cursor: "grab",
        },
        "& .slick-slider, & .slick-list, & .slick-track": {
          height: "100%",
        },
        "& .slick-dots": {
          bottom: 16,
          "& li button:before": {
            fontSize: 10,
            color: theme.palette.common.white,
          },
          "& li.slick-active button:before": {
            color: theme.palette.primary.main,
          },
        },
      }}
    >
      <Slider {...sliderSettings}>
        {images.map((image, index) => (
          <Box
            key={index}
            sx={{
              height: { xs: 200, sm: 300, md: 400 },
              borderRadius: 2,
              position: "relative",
              "& img": {
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: 2,
              },
            }}
          >
            <img src={image} alt={`Carousel image ${index + 1}`} />
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default HyperlocalCarousel;
