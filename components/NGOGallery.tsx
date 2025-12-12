import NGOLightboxClient from "./NGOLightboxClient";

// Generate image paths dynamically
// Note: Images are in public/ngo/ directory
// We have ngo-1.jpg through ngo-16.jpg (some may have typos like ngp-14, ngp-15)
const TOTAL_IMAGES = 16;

const images = Array.from({ length: TOTAL_IMAGES }, (_, i) => {
  const index = i + 1;
  // Handle the typo files (ngp-14, ngp-15)
  const filename = index === 14 || index === 15 ? `ngp-${index}` : `ngo-${index}`;
  return `/ngo/${filename}.webp`;
});

export default function NGOGallery() {
  return <NGOLightboxClient images={images} />;
}

