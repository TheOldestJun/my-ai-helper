import Footer from './Footer';
// components/Layout.js
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-screen-md mx-auto p-4">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;