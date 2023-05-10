import { Image } from 'react-bootstrap'

interface HeroBannerProps {

}

const HeroBannerSection: React.FC<HeroBannerProps> = ({ }) => (
  <div className="px-4 py-5 my-5 text-center">
    <Image width='55%' src='/banner/MyLivingCity_Logo_Name-Tagline.png' />
    <div className="col-lg-9 mx-auto my-4">
        <p className="lead mb-4">
        In order to transform our cities into living cities that exist in complete integrity with the natural world, we need to empower every citizen to engage in a conversation for change and a call to take action in their community.
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