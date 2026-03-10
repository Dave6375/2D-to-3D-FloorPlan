import type { Route } from "./+types/home";
import Navbar from "../../components/Navbar";
import Upload from "../../components/upload";
import {ArrowRight, Clock, GemIcon, Layers} from "lucide-react";
import Button from "../../components/Button";
import {useNavigate} from "react-router";
import React from "react";
import {createProject} from "../../lib/puter.action";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = React.useState<DesignItem[]>([]);

  const handleUploadComplete = async (base64Image: string) => {
    const newId = Date.now().toString();
    const name = `Resience ${newId}`;

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

    setProjects((prev) => [newItem, ...prev]);


    localStorage.setItem(`upload_${newId}`, base64Image);
    navigate(`/visualizer/${newId}`, {
      state: {
        initialImage: saved.sourceImage,
        initialRendered: saved.renderedImage || null,
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
            {projects.map(({ id, name, renderedImage, sourceImage, timestamp }) => (
                
              <div key={id} className="project-card group">
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
