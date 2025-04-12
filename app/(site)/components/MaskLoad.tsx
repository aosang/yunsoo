"use client"

import Image from "next/image"

const maskStyle: React.CSSProperties = {
  position: 'fixed',
  top: '0',
  left: '0',
  width: '100%',
  height: '100vh',
  background: '#fff',
  backgroundSize: "cover",
  zIndex: '1'
}

const imageStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  margin: '-45px 0 0 -226px'
}


const MaskLoad = () => {

  return (
    <div>
      <div style={maskStyle}>
        <Image
          priority
          src="https://www.wangle.run/company_icon/public_image/load-blue.png"
          alt="loadingGif"
          width={452} height={90}
          style={imageStyle}
          unoptimized
        />
      </div>
    </div>

  )
}

export default MaskLoad