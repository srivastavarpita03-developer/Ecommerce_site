You are an experinced web designer with over 15+ years of experince in creating good and impactful designs. You are given a task of creating a full design pages of an e-commerce clothing website. Your design should include pages like home page (With header and image crousal in hero section) and some products that will be shown on hero section, products page where we have one sidebar for filter and on bottom there should be pagination block, about page, contact page, there should be one admin panel which contain dashboard where it will show some matrics about the orders count, total sale,recent orders etc, orders page where admin can see all orders, and a product page from where he can add remove and update product details, create customer my-orders page too. For reference you can use there css varaibles:
:root {

  /* ===============================
     PRIMARY BRAND COLORS
  =============================== */

  --primary: #111827;
  --primary-hover: #0F172A;
  --primary-light: #374151;

  /* CTA Color */
  --accent: #16A34A;
  --accent-hover: #15803D;
  --accent-light: #DCFCE7;

  /* Secondary */
  --secondary: #F5F5F4;
  --secondary-dark: #E7E5E4;

  /* Luxury Highlight */
  --gold: #D4AF37;
  --gold-light: #F9E79F;

  /* ===============================
     BACKGROUNDS
  =============================== */

  --background: #FAFAF9;
  --background-alt: #F4F4F5;
  --surface: #FFFFFF;
  --surface-hover: #FCFCFC;

  /* ===============================
     TEXT COLORS
  =============================== */

  --text-primary: #18181B;
  --text-secondary: #52525B;
  --text-muted: #71717A;
  --text-light: #A1A1AA;
  --text-white: #FFFFFF;

  /* ===============================
     BORDER COLORS
  =============================== */

  --border: #E4E4E7;
  --border-light: #F4F4F5;
  --border-dark: #D4D4D8;

  /* ===============================
     STATUS COLORS
  =============================== */

  --success: #22C55E;
  --warning: #F59E0B;
  --danger: #EF4444;
  --info: #3B82F6;

  --success-bg: #DCFCE7;
  --warning-bg: #FEF3C7;
  --danger-bg: #FEE2E2;
  --info-bg: #DBEAFE;

  /* ===============================
     BUTTONS
  =============================== */

  --btn-primary-bg: var(--primary);
  --btn-primary-hover: #000000;
  --btn-primary-text: #FFFFFF;

  --btn-secondary-bg: #FFFFFF;
  --btn-secondary-hover: #F4F4F5;
  --btn-secondary-text: var(--primary);

  --btn-accent-bg: var(--accent);
  --btn-accent-hover: var(--accent-hover);
  --btn-accent-text: #FFFFFF;

  /* ===============================
     LINKS
  =============================== */

  --link: #2563EB;
  --link-hover: #1D4ED8;

  /* ===============================
     PRODUCT CARD
  =============================== */

  --card-bg: #FFFFFF;
  --card-hover: #FCFCFC;

  /* ===============================
     SHADOWS
  =============================== */

  --shadow-xs:
      0 1px 2px rgba(0,0,0,.04);

  --shadow-sm:
      0 2px 6px rgba(0,0,0,.06);

  --shadow-md:
      0 6px 16px rgba(0,0,0,.08);

  --shadow-lg:
      0 12px 32px rgba(0,0,0,.10);

  --shadow-xl:
      0 24px 64px rgba(0,0,0,.14);

  /* Product Hover Shadow */

  --shadow-product:
      0 20px 50px rgba(17,24,39,.12);

  /* Floating Elements */

  --shadow-floating:
      0 10px 30px rgba(0,0,0,.08);

  /* ===============================
     RADIUS
  =============================== */

  --radius-xs: 6px;
  --radius-sm: 10px;
  --radius-md: 14px;
  --radius-lg: 18px;
  --radius-xl: 24px;
  --radius-full: 999px;

  /* ===============================
     TRANSITIONS
  =============================== */

  --transition-fast: 150ms ease;
  --transition: 250ms ease;
  --transition-slow: 400ms ease;

  /* ===============================
     HEADER
  =============================== */

  --header-bg: rgba(255,255,255,.85);
  --header-border: rgba(0,0,0,.06);
  --header-backdrop: blur(18px);

  /* ===============================
     INPUTS
  =============================== */

  --input-bg: #FFFFFF;
  --input-border: #E4E4E7;
  --input-focus: #16A34A;
  --input-placeholder: #A1A1AA;

  /* ===============================
     BADGES
  =============================== */

  --badge-sale: #DC2626;
  --badge-new: #2563EB;
  --badge-premium: #D4AF37;
  --badge-success: #16A34A;

  /* ===============================
     OVERLAYS
  =============================== */

  --overlay: rgba(0,0,0,.45);
  --overlay-light: rgba(255,255,255,.85);

}