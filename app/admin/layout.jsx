// Admin section layout — replaces root layout for all /admin/* routes.
// This ensures the public Navbar and Footer are NOT rendered inside the admin panel.
export const metadata = {
  title: "Admin — FujiSakura Technologies",
  icons: {
    icon: "/FS-images/Logo-fs.png",
    shortcut: "/FS-images/Logo-fs.png",
    apple: "/FS-images/Logo-fs.png",
  },
};

export default function AdminLayout({ children }) {
  return children;
}
