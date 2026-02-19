import { Container, Carousel } from 'react-bootstrap';
// import { Slider } from 'infinite-react-carousel';
import React, { useMemo } from 'react';
import { API_BASE_URL } from 'src/lib/constants';
import { IAdvertisement } from 'src/lib/types/data/advertisement.type';

//http://madmartech.com/wp-content/uploads/2019/05/970x250-1.png
//https://www.frontiersin.org/files/Articles/70413/fpsyg-05-00166-HTML/image_m/fpsyg-05-00166-g006.jpg
interface AdsSectionProps {
    ads: IAdvertisement[] | undefined;
}

const AdsSection: React.FC<AdsSectionProps> = ({ ads }) => {

    const activeAds = useMemo(() => {
        if (!ads) return [];
        const today = new Date();
        return ads.filter((ad) => {
            if (!ad.duration) return false;
            const expiryDate = new Date(ad.duration);
            return expiryDate > today;
        });
    }, [ads]);

    return (
        <>
            {activeAds.length > 0 && (
                <Container>
                    <Carousel indicators={false} pause={'hover'}>
                        {activeAds.map((ad) => (
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
                    </Carousel>
                </Container>
            )}
        </>
    );
};

export default AdsSection;
