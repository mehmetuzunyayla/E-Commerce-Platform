// client/app/layout.tsx
import '../styles/globals.css';
import Providers from '../components/Providers';
import Navbar from '../components/Navbar';
import WishlistSync from '../components/WishlistSync';
import CartSync from '../components/CartSync';

export const metadata = {
  title: 'E-Commerce App',
  description: 'Next.js 14 E-Commerce App',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <WishlistSync />
          <CartSync />
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
