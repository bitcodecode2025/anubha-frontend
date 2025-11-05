export default function Footer() {
  return (
    <footer className="bg-green-700 dark:bg-green-900 text-white py-8 mt-16">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center md:text-left">
        <div>
          <h3 className="font-semibold text-lg mb-2">Dr. Priya Sharma</h3>
          <p>Certified Nutritionist — Healing through food and balance.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Quick Links</h4>
          <ul className="space-y-1">
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/about">About</a>
            </li>
            <li>
              <a href="/services">Services</a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Contact</h4>
          <p>📍 Mumbai, India</p>
          <p>📞 +91 9876543210</p>
          <p>📧 contact@nutriwell.com</p>
        </div>
      </div>
      <p className="text-center mt-6 text-sm text-white/70">
        © {new Date().getFullYear()} NutriWell | All rights reserved.
      </p>
    </footer>
  );
}
