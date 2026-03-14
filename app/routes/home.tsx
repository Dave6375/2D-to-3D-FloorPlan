import type { Route } from "./+types/home";
import Navbar from "../../components/Navbar";
import Upload from "../../components/upload";
import {ArrowRight, Clock, GemIcon, Layers} from "lucide-react";
import Button from "../../components/Button";
import {useNavigate} from "react-router";
import React from "react";
import {createProject, getProjects} from "../../lib/puter.action";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Simplex - 2D to 3D Platform" },
    { name: "description", content: "Build beautiful spaces at the speed of thought with Simplex" },
  ];
}

/**
 * ### Really simply:
 *
 * This is the **main page** where you can see all your projects and upload new ones.
 *
 * ### Step by stepl
 *
 * - sets up a way to move between pages (`navigate`)
 * - keeps track of your **projects** and whether they are still **loading**
 * - when the page first opens, it **fetches all your projects** from the database
 * - once the projects are found, it updates the list and stops the loading spinner
 *
 * ### One important note
 *
 * This component is the **entry point** for the app. It handles both the **initial data load** and the **uploading process** for new designs.
 */
export default function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = React.useState<DesignItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    /**
     * ### Simple logic:
     *
     * This function runs **once** when the page loads. It:
     * 1. Calls the database to **get your projects**
     * 2. **Sets the projects** to the list you see on screen
     * 3. **Turns off the loading state** no matter what happened (success or error)
     */
    const fetchInitialProjects = async () => {
      try {
        const fetchedProjects = await getProjects();
        setProjects(fetchedProjects);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialProjects();
  }, []);

  const handleUploadComplete = async (base64Image: string) => {
    const newId = Date.now().toString();
    const name = `Residence ${newId}`;

    const newItem: DesignItem = {
      id: newId,
      name,
      sourceImage: base64Image,
      renderedImage: undefined,
      timestamp: Date.now(),
    };

    const saved = await createProject({ item: newItem, visibility: "private" });
    if (!saved) {
        console.error("Failed to create project");
        return false
    }

    setProjects((prev) => [saved, ...prev]);


    localStorage.setItem(`upload_${newId}`, base64Image);
    navigate(`/visualizer/${newId}`, {
      state: {
        initialImage: saved.sourceImage,
        initialRendered: saved.renderedImage || null,
        name: saved.name
      },
    });

    return true;
  };

  return (
    <div className="home">
      <Navbar />

      <section className="hero">
        <div className="announce">
          <div className="dot">
            <div className="pulse"></div>
          </div>

          <p>Introducing Simplex 2D to 3D Platform</p>
        </div>

        <h1>Build beautiful spaces at the speed of thought with Simplex</h1>

        <p className="subtitle">
          Simplex is an AI-first design environment that helps users create and visualize, render, and
          ship architectural projects faster than ever
        </p>

        <div className="actions">
          <a href="#upload" className="cta">
            Get Started <GemIcon className="icon" />
          </a>

          <Button variant="outline" size="lg">
            Watch Demo
          </Button>
        </div>

        <div id="upload" className="upload-shell">
          <div className="grid-overlay" />

          <div className="upload-card">
            <div className="upload-head">
              <div className="upload-icon">
                <Layers className="icon" />
              </div>

              <h2>Upload your illustration</h2>
              <p>Supports JPG, PNG, formats up to 10MB</p>
            </div>

            <Upload onComplete={handleUploadComplete} />
          </div>
        </div>
      </section>

      <section className="projects">
        <div className="section-inner">
          <div className="section-head">
            <div className="copy">
              <h2>Projects</h2>
              <p>Your latest work and shared community projects, all in one place.</p>
            </div>
          </div>

          <div className="projects-grid">
            {loading ? (
              <div className="loading">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="loading">No projects yet. Upload one to get started!</div>
            ) : projects.map(({ id, name, renderedImage, sourceImage, timestamp }) => (


              <div key={id} className="project-card group" onClick={() => navigate(`/visualizer/${id}`, { state: { initialImage: sourceImage, initialRendered: renderedImage || null, name } })}>
                <div className="preview">
                  <img
                    src={renderedImage || sourceImage}
                    alt="project preview"
                  />
                  <div className="badge">
                    <span>Community</span>
                  </div>
                </div>

                <div className="card-body">
                  <div>
                    <h3>{name || "Project Manhattan"}</h3>
                    <div className="meta">
                      <Clock size={12} />
                      <span>{new Date(timestamp || "2027-01-01").toLocaleDateString()}</span>
                      <span>By Simplex</span>
                    </div>
                  </div>
                  <div className="arrow">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
