/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
//追加する
    experimental: {
        appDir: true,
    },
    
};


module.exports = nextConfig
