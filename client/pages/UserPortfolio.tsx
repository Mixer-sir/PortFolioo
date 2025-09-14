import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Project {
  _id: string;
  title: string;
  description: string;
  image?: string;
}

export default function UserPortfolio() {
  const { username } = useParams();
  const [data, setData] = useState<{
    user?: { id: string; username: string };
    projects: Project[];
  }>({ projects: [] });

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/users/${username}/projects`);
      setData(await res.json());
    })();
  }, [username]);

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">
        {data.user?.username}
      </h1>
      <p className="text-muted-foreground mt-2">Портфолио</p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.projects.map((p) => (
          <div
            key={p._id}
            className="border rounded-lg overflow-hidden bg-card"
          >
            {p.image && (
              <img src={p.image} alt="" className="w-full h-40 object-cover" />
            )}
            <div className="p-4">
              <h3 className="font-semibold text-lg">{p.title}</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {p.description}
              </p>
            </div>
          </div>
        ))}
        {data.projects.length === 0 && (
          <div className="text-muted-foreground">Проектов пока нет</div>
        )}
      </div>
    </div>
  );
}
