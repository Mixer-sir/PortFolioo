import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="container py-24 text-center">
      <h1 className="text-6xl font-extrabold">404</h1>
      <p className="text-xl text-muted-foreground mt-2">Страница не найдена</p>
      <Link to="/" className="inline-block mt-6 underline">
        На главную
      </Link>
    </div>
  );
};

export default NotFound;
