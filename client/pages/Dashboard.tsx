import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Project {
  _id: string;
  title: string;
  description: string;
  image?: string;
}

function ProjectForm({
  initial,
  onSubmit,
}: {
  initial?: Partial<Project>;
  onSubmit: (p: {
    title: string;
    description: string;
    image?: string;
  }) => Promise<void>;
}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [image, setImage] = useState(initial?.image || "");
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="space-y-4 max-w-xl"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        try {
          await onSubmit({ title, description, image: image || undefined });
        } catch {
          setError("Ошибка сохранения");
        }
      }}
    >
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Название проекта"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full border rounded px-3 py-2 h-32"
        placeholder="Описание"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Ссылка на изображение (опционально)"
        value={image}
        onChange={(e) => setImage(e.target.value)}
      />
      {error && <p className="text-destructive text-sm">{error}</p>}
      <Button type="submit">Сохранить</Button>
    </form>
  );
}

function List() {
  const [projects, setProjects] = useState<Project[]>([]);
  const nav = useNavigate();
  const load = async () => {
    const res = await apiFetch("/api/projects");
    setProjects(res.projects);
  };
  useEffect(() => {
    load();
  }, []);
  return (
    <div className="container py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Мои проекты</h1>
        <Link to="create">
          <Button>Добавить проект</Button>
        </Link>
      </div>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <div
            key={p._id}
            className="border rounded-lg overflow-hidden bg-card"
          >
            {p.image && (
              <img src={p.image} alt="" className="w-full h-40 object-cover" />
            )}
            <div className="p-4">
              <h3 className="font-semibold text-lg">{p.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {p.description}
              </p>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" onClick={() => nav(`edit/${p._id}`)}>
                  Редактировать
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    await apiFetch(`/api/projects/${p._id}`, {
                      method: "DELETE",
                    });
                    load();
                  }}
                >
                  Удалить
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Create() {
  const nav = useNavigate();
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Новый проект</h1>
      <ProjectForm
        onSubmit={async (data) => {
          await apiFetch("/api/projects", {
            method: "POST",
            body: JSON.stringify(data),
          });
          nav("/dashboard");
        }}
      />
    </div>
  );
}

function Edit() {
  const { id } = useParams();
  const nav = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  useEffect(() => {
    (async () => {
      const res = await apiFetch("/api/projects");
      const found = (res.projects as Project[]).find((p) => p._id === id);
      if (found) setProject(found);
    })();
  }, [id]);
  if (!project) return <div className="container py-10">Загрузка...</div>;
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Редактировать</h1>
      <ProjectForm
        initial={project}
        onSubmit={async (data) => {
          await apiFetch(`/api/projects/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
          });
          nav("/dashboard");
        }}
      />
    </div>
  );
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (!token) nav("/login");
  }, [token]);
  return (
    <Routes>
      <Route index element={<List />} />
      <Route path="create" element={<Create />} />
      <Route path="edit/:id" element={<Edit />} />
    </Routes>
  );
}
