/* MSV Consulting - Home Page
 * Design: Contemporary European Corporate — Bold Geometry
 * Sections: Navbar, Hero, Services, About, WhyUs, Contact, Footer
 */

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import AboutSection from "@/components/AboutSection";
import WhyUsSection from "@/components/WhyUsSection";
import CTABanner from "@/components/CTABanner";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <WhyUsSection />
      <CTABanner />
      <ContactSection />
      <Footer />
    </div>
  );
}
