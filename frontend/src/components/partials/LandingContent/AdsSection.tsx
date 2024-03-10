import { Container, Carousel } from 'react-bootstrap';
// import { Slider } from 'infinite-react-carousel';
import React from 'react';
import { API_BASE_URL } from 'src/lib/constants';
import { IAdvertisement } from 'src/lib/types/data/advertisement.type';

//http://madmartech.com/wp-content/uploads/2019/05/970x250-1.png
//https://www.frontiersin.org/files/Articles/70413/fpsyg-05-00166-HTML/image_m/fpsyg-05-00166-g006.jpg
interface AdsSectionProps {
  ads: IAdvertisement[] | undefined;
}

const AdsSection: React.FC<AdsSectionProps> = ({ ads }) => {
    if (ads !== undefined) {
        return (
            <Container>
                {/* <h2 className="pb-1 border-bottom display-6 text-center">Our Locals</h2> */}
                <Carousel indicators={false} pause={'hover'}>
                    {ads.map((ad) => (
                        <Carousel.Item
                            interval={5000}
                            key={ad.id}
                            style={{ justifyContent: 'center' }}
                        >
                            <a href={ad.externalLink}>
                                <img
                                    alt='Not found...'
                                    className='d-block w-100'
                                    style={{
                                        margin: '0 auto',
                                        maxHeight: '150px',
                                        maxWidth: '100%',
                                    }}
                                    src={ad.imagePath}
                                />
                            </a>
                        </Carousel.Item>
                    ))}

                    {/* <Carousel.Item interval={5000}>
                        <a href='https://99designs.ca/blog/marketing-advertising/14-design-tips-for-more-clickable-banner-ads/'>
                            <img
                            className="d-block w-100"
                            src="https://www.frontiersin.org/files/Articles/70413/fpsyg-05-00166-HTML/image_m/fpsyg-05-00166-g006.jpg"
                            />
                        </a>
                    </Carousel.Item> */}
                </Carousel>
            </Container>
        );
    } else {
        return <></>;
    }
};

export default AdsSection;
