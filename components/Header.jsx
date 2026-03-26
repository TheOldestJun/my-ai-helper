import Image from 'next/image';
// components/Header.js
import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-cyan-100 py-2 flex justify-between items-center">
      <div className="ml-4">
        <Image src="/logo.png" alt="Logo" width={40} height={40} />
      </div>
      <nav className="mr-4">
        <ul className="flex items-center">
          <li className="mr-4">
            <Link href="#">
              <>Помощь</>
            </Link>
          </li>
          <li>
            <Link href="#">
              <>Выход</>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;