/** @type {import('next').NextConfig} */
const path = require('path')
// const isProd = process.env.NODE_ENV === "production";
const nextConfig = {
  // experimental: {
  //   missingSuspenseWithCSRBailout: false
  // },
  optimizeFonts: false,
  transpilePackages: ['antd'],
  experimental: {
    optimizeCss: true
  },

  images: {
    domains: ['www.wangle.run'], // 确保这里的数组包含你要使用的域名
    unoptimized: true,
  },
   
  trailingSlash: true,
  output: 'export',
  // basePath: '/assetsmanager',
  // assetPrefix: '/assetsmanager',
  basePath: '',
  assetPrefix: '',

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './'),
      '@components': path.join(__dirname, './app/(site)/components')
    }
    return config
  }
}

module.exports = nextConfig
