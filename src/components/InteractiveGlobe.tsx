import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, X } from "lucide-react";

interface CountryData {
  name: string;
  code: string;
  population: string;
  capital: string;
  description: string;
}

const countries: { [key: string]: CountryData } = {
  'IT': {
    name: 'Italia',
    code: 'IT',
    population: '60M',
    capital: 'Roma',
    description: 'Terra di arte, cultura e gastronomia straordinaria.'
  },
  'FR': {
    name: 'Francia',
    code: 'FR', 
    population: '67M',
    capital: 'Parigi',
    description: 'Patria dell\'eleganza, della moda e della cucina raffinata.'
  },
  'JP': {
    name: 'Giappone',
    code: 'JP',
    population: '125M',
    capital: 'Tokyo',
    description: 'Fusione unica di tradizioni millenarie e innovazione tecnologica.'
  },
  'US': {
    name: 'Stati Uniti',
    code: 'US',
    population: '331M',
    capital: 'Washington DC',
    description: 'Terra di opportunità con paesaggi mozzafiato e cultura variegata.'
  }
};

export const InteractiveGlobe = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const globeRef = useRef<THREE.Mesh>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;

    // Setup scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(800, 600);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Create globe
    const geometry = new THREE.SphereGeometry(2, 64, 64);
    const material = new THREE.MeshPhongMaterial({
      color: 0x2563eb,
      transparent: true,
      opacity: 0.8,
      shininess: 100
    });
    
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Add continents as separate meshes for interaction
    const continents = [
      // Europa
      { position: [0.5, 1, 1.5], color: 0x10b981, country: 'IT' },
      { position: [-0.3, 1.2, 1.4], color: 0x10b981, country: 'FR' },
      // Asia  
      { position: [1.5, 0.8, 1], color: 0xf59e0b, country: 'JP' },
      // Nord America
      { position: [-1.2, 0.5, 1.3], color: 0xef4444, country: 'US' }
    ];

    const continentMeshes: THREE.Mesh[] = [];
    continents.forEach((continent, index) => {
      const contGeometry = new THREE.SphereGeometry(0.15, 16, 16);
      const contMaterial = new THREE.MeshPhongMaterial({ 
        color: continent.color,
        transparent: true,
        opacity: 0.9
      });
      const contMesh = new THREE.Mesh(contGeometry, contMaterial);
      contMesh.position.set(continent.position[0], continent.position[1], continent.position[2]);
      contMesh.userData = { country: continent.country, index };
      continentMeshes.push(contMesh);
      scene.add(contMesh);
    });

    // Position camera
    camera.position.z = 6;

    // Mouse interaction
    let mouseDown = false;
    let mouseX = 0;
    let mouseY = 0;

    const onMouseDown = (event: MouseEvent) => {
      mouseDown = true;
      setIsRotating(false);
    };

    const onMouseUp = () => {
      mouseDown = false;
      setTimeout(() => setIsRotating(true), 2000);
    };

    const onMouseMove = (event: MouseEvent) => {
      if (mouseDown) {
        const deltaX = event.clientX - mouseX;
        const deltaY = event.clientY - mouseY;
        
        globe.rotation.y += deltaX * 0.005;
        globe.rotation.x += deltaY * 0.005;
        
        continentMeshes.forEach(mesh => {
          mesh.rotation.y += deltaX * 0.005;
          mesh.rotation.x += deltaY * 0.005;
        });
      }
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    // Click detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(continentMeshes);

      if (intersects.length > 0) {
        const countryCode = intersects[0].object.userData.country;
        setSelectedCountry(countries[countryCode]);
      }
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);

    // Store refs
    sceneRef.current = scene;
    rendererRef.current = renderer;
    globeRef.current = globe;
    cameraRef.current = camera;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (isRotating && !mouseDown) {
        globe.rotation.y += 0.002;
        continentMeshes.forEach(mesh => {
          mesh.rotation.y += 0.002;
        });
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isRotating]);

  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Esplora il <span className="text-primary">Mondo</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Clicca sui continenti per scoprire destinazioni straordinarie e storie di viaggiatori
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Globe Container */}
          <div className="relative">
            <div 
              ref={mountRef} 
              className="w-[800px] h-[600px] max-w-full mx-auto rounded-2xl shadow-hero bg-gradient-to-br from-primary/5 to-accent/5 border border-border/20"
            />
            
            {/* Controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsRotating(!isRotating)}
                className="bg-white/90 backdrop-blur-sm"
              >
                {isRotating ? 'Pausa' : 'Ruota'}
              </Button>
            </div>

            {/* Istruzioni */}
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white p-3 rounded-lg text-sm">
              <p>🖱️ Trascina per ruotare • 🖱️ Clicca sui punti colorati</p>
            </div>
          </div>

          {/* Country Info Panel */}
          {selectedCountry && (
            <Card className="p-8 max-w-md bg-gradient-card border-border/50 shadow-travel">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-primary" />
                  <h3 className="text-2xl font-bold text-foreground">{selectedCountry.name}</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSelectedCountry(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Capitale</label>
                  <p className="text-lg text-foreground">{selectedCountry.capital}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Popolazione</label>
                  <p className="text-lg text-foreground">{selectedCountry.population}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Descrizione</label>
                  <p className="text-foreground leading-relaxed">{selectedCountry.description}</p>
                </div>
                
                <Button variant="travel" className="w-full mt-6">
                  Scopri Esperienze in {selectedCountry.name}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};