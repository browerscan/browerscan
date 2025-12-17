# OG Image & Social Media Preview Guide

Guide for creating and configuring Open Graph images and social media previews for BrowserScan.org.

## Table of Contents

- [Overview](#overview)
- [Image Specifications](#image-specifications)
- [Design Guidelines](#design-guidelines)
- [Creating the OG Image](#creating-the-og-image)
- [Implementation](#implementation)
- [Testing](#testing)
- [Platform-Specific Considerations](#platform-specific-considerations)

---

## Overview

Open Graph (OG) images appear when your website is shared on social media platforms like Twitter, Facebook, LinkedIn, and messaging apps like Slack and Discord. A well-designed OG image increases click-through rates and brand recognition.

**Current Status**: The project has OG image metadata configured but needs the actual image file created.

**Location**: `apps/web/public/og-image.png`

---

## Image Specifications

### Technical Requirements

| Property | Value | Notes |
|----------|-------|-------|
| **Dimensions** | 1200 × 630 pixels | Standard OG image size |
| **Aspect Ratio** | 1.91:1 | Widely supported |
| **File Format** | PNG or JPG | PNG recommended for sharp text |
| **File Size** | < 1 MB | < 300 KB recommended |
| **Color Space** | sRGB | For consistent color rendering |
| **Safe Zone** | 1200 × 600 px | Avoid important content in outer 30px |

### Platform Display Sizes

Different platforms crop/display OG images differently:

- **Twitter**: 1200 × 628 px (large image card)
- **Facebook**: 1200 × 630 px (full size)
- **LinkedIn**: 1200 × 627 px (similar to Facebook)
- **Slack/Discord**: Usually 1200 × 630 px with rounded corners

**Design Tip**: Keep critical content (logo, text) centered in a 1140 × 600 px safe zone.

---

## Design Guidelines

### Visual Hierarchy

1. **Primary Element** (60% of space)
   - BrowserScan logo or main visual
   - Trust score visualization (health ring)
   - Browser fingerprint icon

2. **Secondary Element** (30% of space)
   - Tagline: "Browser Fingerprint & Trust Score Analyzer"
   - Key benefit or feature highlight

3. **Background** (10% of space)
   - Subtle gradient or pattern
   - Brand colors from design system

### Color Palette

Use BrowserScan's established color scheme:

```css
/* Primary Colors */
--zinc-950: #09090b;     /* Background */
--zinc-100: #f4f4f5;     /* Primary text */
--emerald-500: #10b981;  /* Safe/Success */
--rose-500: #f43f5e;     /* Risk/Warning */
--amber-500: #f59e0b;    /* Caution */
--sky-400: #38bdf8;      /* Info/Accent */

/* Gradients */
Emerald to Rose: Linear gradient from #10b981 to #f43f5e
Dark to Darker: Linear gradient from #18181b to #09090b
```

### Typography

- **Primary Font**: Geist Sans (or similar sans-serif)
- **Heading Size**: 72-96px (bold)
- **Subheading Size**: 36-48px (medium)
- **Body Text**: 24-32px (regular)

**Text Guidelines**:
- High contrast (light text on dark background)
- Avoid thin font weights (minimum 500)
- Maximum 2-3 lines of text
- Use sentence case, not ALL CAPS

### Layout Templates

#### Template 1: Logo + Tagline (Simple)

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│         [BrowserScan Logo]          │
│                                     │
│    Browser Fingerprint Analyzer     │
│      Real-Time Trust Scoring        │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

#### Template 2: Visual + Text (Recommended)

```
┌─────────────────────────────────────┐
│                                     │
│  [Health Ring]    BrowserScan       │
│     Score: 87     ──────────────    │
│     Grade: A      Fingerprint &     │
│                   Trust Score       │
│                   Analyzer          │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

#### Template 3: Feature Highlight

```
┌─────────────────────────────────────┐
│  BrowserScan.org                    │
│                                     │
│  ✓ TLS Fingerprinting               │
│  ✓ WebRTC Leak Detection            │
│  ✓ Bot Detection (JA3/JA4)          │
│  ✓ Real-Time Trust Scoring          │
│                                     │
│  browserscan.org                    │
└─────────────────────────────────────┘
```

---

## Creating the OG Image

### Option 1: Using Design Tools (Figma/Sketch)

**Figma Template**:

1. Create a frame: 1200 × 630 px
2. Add background:
   ```
   Fill: Linear gradient
   From: #18181b (top-left)
   To: #09090b (bottom-right)
   ```
3. Add logo/visual element (centered):
   - Import or recreate health ring graphic
   - Size: 300 × 300 px
   - Position: Center-left (300px from left edge)
4. Add text (right side):
   - Heading: "BrowserScan" (Geist Sans Bold, 96px, #f4f4f5)
   - Subheading: "Browser Fingerprint & Trust Score Analyzer" (Geist Sans Medium, 36px, #a1a1aa)
5. Add accent elements:
   - Subtle circuit board pattern (10% opacity)
   - Small fingerprint icon
   - Version indicator (bottom-right corner)
6. Export:
   - Format: PNG
   - Scale: 2x (for retina displays)
   - Optimize: Run through TinyPNG

**Download Figma Template**: [Link to community template if available]

### Option 2: Using Code (Canvas API)

Create `scripts/generate-og-image.ts`:

```typescript
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';

const WIDTH = 1200;
const HEIGHT = 630;

async function generateOGImage() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, '#18181b');
  gradient.addColorStop(1, '#09090b');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Text
  ctx.fillStyle = '#f4f4f5';
  ctx.font = 'bold 96px "Geist Sans", sans-serif';
  ctx.fillText('BrowserScan', 500, 280);

  ctx.fillStyle = '#a1a1aa';
  ctx.font = '36px "Geist Sans", sans-serif';
  ctx.fillText('Browser Fingerprint & Trust Score Analyzer', 500, 350);

  // Export
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('apps/web/public/og-image.png', buffer);
  console.log('OG image generated successfully!');
}

generateOGImage().catch(console.error);
```

Run with:
```bash
npm install canvas
npx ts-node scripts/generate-og-image.ts
```

### Option 3: Using Online Tools

**Recommended Tools**:

1. **Cloudinary** - https://cloudinary.com/tools/social-media-asset-generator
   - Free tier available
   - Templates for OG images
   - Automatic optimization

2. **Canva** - https://www.canva.com
   - Search "Open Graph Image"
   - Custom dimensions: 1200 × 630
   - Free templates available

3. **OG Image Playground** - https://og-playground.vercel.app
   - Generate programmatically
   - Export PNG

---

## Implementation

### Current Configuration

The OG image metadata is already configured in `apps/web/src/app/layout.tsx`:

```typescript
openGraph: {
  title: 'BrowserScan — Free Browser Fingerprint & Trust Score Analyzer',
  description: 'Analyze your browser fingerprint...',
  type: 'website',
  siteName: 'BrowserScan',
  locale: 'en_US',
  url: SITE_URL,
  images: [
    {
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'BrowserScan - Browser Fingerprint & Trust Score Analyzer',
    },
  ],
},
twitter: {
  card: 'summary_large_image',
  title: 'BrowserScan — Browser Fingerprint & Trust Score Analyzer',
  description: 'Free browser fingerprint test...',
  creator: '@browserscan',
  images: ['/og-image.png'],
},
```

### Adding the Image

1. **Create your OG image** using one of the methods above
2. **Save as** `apps/web/public/og-image.png`
3. **Verify file size** < 1 MB (ideally < 300 KB)
4. **Commit to repository**:
   ```bash
   git add apps/web/public/og-image.png
   git commit -m "Add Open Graph image for social media previews"
   git push
   ```

### Dynamic OG Images (Advanced)

For page-specific OG images, use Next.js's `generateMetadata`:

```typescript
// Example: apps/web/src/app/(public)/report/network/page.tsx
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Network Report | BrowserScan',
    openGraph: {
      title: 'Network Analysis Report - BrowserScan',
      description: 'Detailed network fingerprinting and leak detection results',
      images: ['/og-image-network.png'], // Custom image
    },
  };
}
```

---

## Testing

### Local Testing

1. **Build the project**:
   ```bash
   npm run build
   npm start
   ```

2. **View in browser**:
   - Open DevTools → Elements
   - Search for `<meta property="og:image"`
   - Verify URL points to `/og-image.png`

3. **Check image loads**:
   - Navigate to http://localhost:3000/og-image.png
   - Image should display correctly

### Social Media Validation Tools

Test how your OG image appears across platforms:

1. **Twitter Card Validator**
   - URL: https://cards-dev.twitter.com/validator
   - Enter: https://browserscan.org
   - Click "Preview card"
   - Check image displays correctly

2. **Facebook Sharing Debugger**
   - URL: https://developers.facebook.com/tools/debug/
   - Enter: https://browserscan.org
   - Click "Scrape Again" to refresh cache
   - Check "Image Preview" section

3. **LinkedIn Post Inspector**
   - URL: https://www.linkedin.com/post-inspector/
   - Enter: https://browserscan.org
   - Check preview

4. **OpenGraph.xyz**
   - URL: https://www.opengraph.xyz
   - Enter: https://browserscan.org
   - See previews for multiple platforms at once

### Troubleshooting

#### Image Not Showing

**Issue**: OG image doesn't appear when shared

**Solutions**:
1. Verify file exists at `/public/og-image.png`
2. Check file size < 1 MB
3. Clear social media cache (use debugging tools above)
4. Ensure image URL is absolute (include domain)
5. Check Content-Type header is `image/png`

#### Image Appears Blurry

**Issue**: Image looks pixelated or blurry

**Solutions**:
1. Export at 2x resolution (2400 × 1260 px) then scale down
2. Use PNG format instead of JPG
3. Disable compression in export settings
4. Use vector graphics where possible

#### Image Cropped Incorrectly

**Issue**: Platform crops important content

**Solutions**:
1. Keep critical content in 1140 × 600 px safe zone
2. Test on multiple platforms before finalizing
3. Avoid text/logos near edges
4. Consider platform-specific images if needed

---

## Platform-Specific Considerations

### Twitter / X

- Use `summary_large_image` card type (already configured)
- Image displayed at 2:1 aspect ratio
- Text should be legible at small sizes
- Dark mode: Ensure text has sufficient contrast

### Facebook

- Minimum dimensions: 1200 × 630 px
- Maximum file size: 8 MB (but keep under 1 MB for speed)
- Avoid text covering > 20% of image (though this rule is less strict now)
- Cache updates slowly - use debugger to force refresh

### LinkedIn

- Professional aesthetic preferred
- Avoid overly promotional language
- Business-focused messaging works best
- Similar size to Facebook (1200 × 627 px)

### Discord / Slack

- Images often have rounded corners
- Keep important content away from edges
- File size matters for embed speed
- Links preview automatically

### WhatsApp

- Maximum dimensions: 300 × 300 px (will be scaled down)
- Simpler designs work better due to small size
- Focus on logo/brand recognition

---

## Best Practices

### Do's

✓ Use high contrast (light text on dark background or vice versa)
✓ Keep text concise (max 2-3 lines)
✓ Make logo/brand prominent
✓ Use consistent brand colors
✓ Test on multiple platforms before launch
✓ Optimize file size (< 300 KB ideal)
✓ Use vector graphics where possible
✓ Include call to action (subtle, like "Try Now")

### Don'ts

✗ Don't use thin fonts (minimum weight: 500)
✗ Don't put critical content near edges
✗ Don't use low-contrast color combinations
✗ Don't include too much text (overwhelming)
✗ Don't use generic stock photos
✗ Don't forget to test on mobile
✗ Don't exceed 1 MB file size
✗ Don't use animated GIFs (most platforms don't support)

---

## Quick Start Checklist

For immediate implementation:

- [ ] Choose design template (Template 2 recommended)
- [ ] Select design tool (Figma, Canva, or code)
- [ ] Create 1200 × 630 px image
- [ ] Use BrowserScan brand colors and fonts
- [ ] Keep critical content in safe zone
- [ ] Export as PNG < 300 KB
- [ ] Save to `apps/web/public/og-image.png`
- [ ] Test locally at http://localhost:3000/og-image.png
- [ ] Validate with Twitter Card Validator
- [ ] Validate with Facebook Sharing Debugger
- [ ] Deploy to production
- [ ] Share on social media to verify

---

## Resources

### Design Assets

- **Brand Colors**: See `apps/web/tailwind.config.js`
- **Fonts**: Geist Sans (already loaded)
- **Logo**: [If you have an SVG logo, reference it here]
- **Icons**: Can use lucide-react icons or custom SVG

### Tools & References

- **Figma**: https://figma.com
- **Canva**: https://canva.com
- **TinyPNG**: https://tinypng.com (image compression)
- **OG Image Examples**: https://ogimage.gallery

### Documentation

- **Open Graph Protocol**: https://ogp.me
- **Twitter Cards**: https://developer.twitter.com/en/docs/twitter-for-websites/cards
- **Facebook OG**: https://developers.facebook.com/docs/sharing/webmasters

---

**Last Updated**: 2025-01-15
**Version**: 1.0.0
**Status**: Pending image creation (metadata configured, file needed)
