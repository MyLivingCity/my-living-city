import { Container, Carousel } from "react-bootstrap";
import { useMemo } from "react";
import { type IAdvertisement } from "src/lib/types/home/advertisement.types";
import { usePublishedAds } from "src/hooks/advertisementHooks";

export const AdsSection = () => {
  const { data: ads } = usePublishedAds();

  const activeAds = useMemo(() => {
    if (!Array.isArray(ads)) return [];

    const today = new Date();

    return ads.filter((ad: IAdvertisement) => {
      return ad.duration && new Date(ad.duration) > today;
    });
  }, [ads]);

  if (!activeAds.length) return null;

  return (
    <Container>
      <Carousel indicators={false} pause="hover">
        {activeAds.map((ad: IAdvertisement) => (
          <Carousel.Item
            interval={5000}
            key={ad.id}
            style={{ justifyContent: "center" }}
          >
            <a href={ad.externalLink}>
              <img
                alt="Advertisement"
                className="d-block w-100"
                style={{
                  margin: "0 auto",
                  maxHeight: "150px",
                  maxWidth: "100%",
                }}
                src={ad.imagePath}
              />
            </a>
          </Carousel.Item>
        ))}
      </Carousel>
    </Container>
  );
};

export default AdsSection;
