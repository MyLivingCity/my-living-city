import { Image } from 'react-bootstrap'

interface HeroBannerProps {

}

const HeroBannerSection: React.FC<HeroBannerProps> = ({ }) => (
  <div className="px-4 py-5 my-5 text-center">
    <Image width='55%' src='/banner/MyLivingCity_Logo_Name-Tagline.png' />
    <div className="col-lg-9 mx-auto my-4">
        <p className="lead mb-4">
        MyLivingCity's mission is to create online discussion spaces for empowering community members to share ideas and have opportunities to work together.  This is where real sustainable innovation is born.  We aim to partner with municipalities and community members to host these important discussions.
        </p>
      <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
        <a href='/ideas'>
          <button type="button" className="btn btn-primary btn-lg px-4 me-sm-3">
            View Conversations
          </button>
        </a>
      </div>
    </div>
  </div>
)

export default HeroBannerSection