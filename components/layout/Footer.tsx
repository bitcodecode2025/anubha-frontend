import Link from "next/link";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="border-t border-[#dfe7dd] bg-white/80 text-slate-600 py-12 backdrop-blur-sm relative z-[100]">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-12 text-center md:text-left">
        {/* Brand / Intro */}
        <div>
          <h3 className="font-semibold text-lg mb-2 text-slate-900">
            Anubha's Nutrition Clinic
          </h3>
          <h4 className="font-semibold text-md mb-3 text-slate-900">
            Dt. Anubha Issac
          </h4>
          <p className="text-slate-600 leading-relaxed text-sm">
            Certified Nutritionist dedicated to helping you heal through
            personalized nutrition, mindful balance, and sustainable wellness.
          </p>

          {/* Social Icons */}
          <div className="mt-4 flex justify-center md:justify-start gap-4">
            <Link
              href="https://www.facebook.com/anu.foodclinic"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-[#f4f9f6] hover:bg-[#1877F2]/10 transition-all duration-300 text-[#1877F2] hover:scale-110"
              title="Facebook"
            >
              <FaFacebookF size={20} />
            </Link>

            <Link
              href="https://www.instagram.com/anubhas_nutrition_clinic/?igsh=cnA5cTNnenQyazlh#"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-[#f4f9f6] hover:bg-[#E1306C]/10 transition-all duration-300 text-[#E1306C] hover:scale-110"
              title="Instagram"
            >
              <FaInstagram size={20} />
            </Link>

            <Link
              href="https://www.linkedin.com/in/anubha-isaac-0799a454/?utm_source=share&utm_campaign=share_via&utm_content=profile"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-[#f4f9f6] hover:bg-[#0077B5]/10 transition-all duration-300 text-[#0077B5] hover:scale-110"
              title="LinkedIn"
            >
              <FaLinkedinIn size={20} />
            </Link>

            {/* YouTube */}
            <Link
              href="https://www.youtube.com/@anubhasnutritionclinic"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-[#f4f9f6] hover:bg-red-600/10 transition-all duration-300 text-red-600 hover:scale-110"
              title="YouTube"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M8.051 1.999h.09c1.27.006 5.08.052 6.37.343a2.01 2.01 0 0 1 1.415 1.42c.29 1.29.336 4.997.341 6.267v.1c-.005 1.27-.05 5.08-.341 6.37a2.01 2.01 0 0 1-1.415 1.415c-1.29.29-5.1.336-6.37.341h-.1c-1.27-.005-5.08-.05-6.37-.341A2.01 2.01 0 0 1 .175 16.5C-.115 15.21-.16 11.5-.165 10.23v-.1c.005-1.27.052-5.08.343-6.37A2.01 2.01 0 0 1 1.77 2.44c1.29-.29 5.1-.336 6.37-.341zm-1.507 4.64v4.72l4.19-2.36-4.19-2.36z" />
              </svg>
            </Link>

            {/* WhatsApp */}
            <Link
              href="https://www.whatsapp.com/channel/0029VbAeT6FBlHpV059IFw2i"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-[#f4f9f6] hover:bg-green-600/10 transition-all duration-300 text-green-600 hover:scale-110"
              title="WhatsApp"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M13.601 2.326A7.932 7.932 0 0 0 8.017 0C3.636 0 .134 3.574.134 7.972c0 1.406.367 2.782 1.057 3.987L0 16l4.158-1.164a8.022 8.022 0 0 0 3.859.98h.004c4.38 0 7.883-3.574 7.883-7.972a7.93 7.93 0 0 0-2.303-5.518zm-5.584 12.83h-.003a6.69 6.69 0 0 1-3.41-.93l-.244-.144-2.472.692.66-2.41-.159-.248A6.622 6.622 0 0 1 1.27 7.97c0-3.683 3.02-6.676 6.746-6.676a6.69 6.69 0 0 1 4.73 1.958 6.63 6.63 0 0 1 1.934 4.72c0 3.683-3.02 6.676-6.763 6.676zm3.707-4.993c-.203-.102-1.203-.594-1.39-.662-.187-.068-.324-.102-.46.102-.136.203-.527.662-.647.797-.119.136-.238.153-.44.051-.203-.102-.856-.316-1.63-1.008-.602-.53-1.008-1.183-1.127-1.387-.119-.203-.013-.313.09-.415.093-.092.204-.238.306-.357.102-.119.136-.203.204-.34.068-.136.034-.255-.017-.357-.051-.102-.46-1.11-.63-1.52-.165-.397-.334-.343-.46-.35l-.393-.007c-.136 0-.357.051-.544.255-.187.203-.713.694-.713 1.69s.73 1.963.83 2.102c.102.136 1.437 2.188 3.487 3.063.487.21.867.336 1.163.43.488.155.93.133 1.28.081.39-.058 1.203-.492 1.373-.968.17-.476.17-.884.119-.968-.051-.085-.187-.136-.39-.238z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold mb-3 text-slate-900">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/"
                className="hover:text-emerald-700 transition-colors duration-200"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/#about"
                className="hover:text-emerald-700 transition-colors duration-200"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/services"
                className="hover:text-emerald-700 transition-colors duration-200"
              >
                Services
              </Link>
            </li>
            <li>
              <Link
                href="/#faq"
                className="hover:text-emerald-700 transition-colors duration-200"
              >
                FAQ
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold mb-3 text-slate-900">Contact</h4>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              📍 Office no. 1, Upper Ground Floor, Kanaksai CHS Ltd., S.No.56,
              Jagdamba Bhavan Marg, Undri, Pune (411060), India
            </li>
            <li>📞 +91 9713885582</li>
            <li>
              <a
                href="mailto:anubhasnutritionclinic@gmail.com"
                className="hover:text-emerald-700 transition-colors duration-200"
              >
                📧 anubhasnutritionclinic@gmail.com
              </a>
            </li>
          </ul>
        </div>

        {/* Find Us */}
        <div>
          <h4 className="font-semibold mb-3 text-slate-900">Find Us</h4>
          <p className="text-slate-600 text-sm mb-3">
            Visit us at our clinic location in Pune, India.
          </p>
          <Link
            href="https://maps.app.goo.gl/rH8taHya1obyZsCu9?g_st=aw"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors"
          >
            Open in Google Maps
          </Link>
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-6xl mx-auto mt-10 border-t border-[#dfe7dd] pt-6">
        <p className="text-center text-sm text-slate-500">
          © {currentYear} Anubha's Nutrition Clinic — All rights reserved.
        </p>
        <div>
          <p className="text-white text-sm">
            Created and Powered by Tanishk Khare
          </p>
        </div>
      </div>
    </footer>
  );
}
