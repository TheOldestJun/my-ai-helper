import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <div className="text-sm">
            <span className="font-medium text-white">My AI Helper</span>
            <span className="mx-2">·</span>
            <span className="text-slate-400">&copy; {currentYear}</span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-4 text-sm">
            <Link href="#" className="text-slate-400 hover:text-white transition-colors duration-200">
              Контакти
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;