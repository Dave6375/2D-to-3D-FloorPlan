import type { Route } from "./+types/home";
import Navbar from "../../components/Navbar";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
      <div className='home'>
        <Navbar />

          <section className='hero'>
              <div className='announce'>
                  <div className='dot'>
                      <div className='pulse'></div>
                  </div>

                  <p>Introducing Simplex 2D to 3D Platform</p>

                  <h1>Build beautiful spaces at the speed of though with Simplex</h1>


              </div>
          </section>
      </div>
  )
}
