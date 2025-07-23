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
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth > 1024 ? 800 / 800 : 600 / 600, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    const size = window.innerWidth > 1024 ? 800 : 600;
    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Create globe
    const geometry = new THREE.SphereGeometry(2.5, 128, 128);
    const material = new THREE.MeshPhongMaterial({
      color: 0x1e40af,
      transparent: true,
      opacity: 0.9,
      shininess: 150,
      wireframe: false
    });
    
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Add continents as separate meshes for interaction
    const continents = [
      // Europa
      { position: [0.6, 1.3, 2], color: 0x10b981, country: 'IT' },
      { position: [-0.4, 1.5, 1.8], color: 0x059669, country: 'FR' },
      // Asia  
      { position: [2, 1, 1.3], color: 0xf59e0b, country: 'JP' },
      // Nord America
      { position: [-1.5, 0.7, 1.7], color: 0xef4444, country: 'US' }
    ];

    const continentMeshes: THREE.Mesh[] = [];
    continents.forEach((continent, index) => {
      const contGeometry = new THREE.SphereGeometry(0.2, 32, 32);
      const contMaterial = new THREE.MeshPhongMaterial({ 
        color: continent.color,
        transparent: true,
        opacity: 1,
        emissive: continent.color,
        emissiveIntensity: 0.3
      });
      const contMesh = new THREE.Mesh(contGeometry, contMaterial);
      contMesh.position.set(continent.position[0], continent.position[1], continent.position[2]);
      contMesh.userData = { country: continent.country, index };
      continentMeshes.push(contMesh);
      scene.add(contMesh);
    });

    // Position camera
    camera.position.z = 7;

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
        globe.rotation.y += 0.005;
        continentMeshes.forEach(mesh => {
          mesh.rotation.y += 0.005;
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
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 animate-fade-up">
            Esplora il <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Mondo</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-fade-up [animation-delay:0.2s]">
            Clicca sui paesi del mappamondo interattivo per scoprire destinazioni straordinarie
          </p>
        </div>

        <div className="flex flex-col xl:flex-row items-center justify-center gap-16">
          {/* Globe Container - Primo Piano */}
          <div className="relative animate-fade-up [animation-delay:0.4s]">
            <div 
              ref={mountRef} 
              className="w-[600px] h-[600px] lg:w-[800px] lg:h-[800px] max-w-full mx-auto rounded-full shadow-hero bg-gradient-to-br from-primary/10 via-background to-accent/10 border-2 border-primary/20"
            />
            
            {/* Controls */}
            <div className="absolute top-6 right-6 flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsRotating(!isRotating)}
                className="bg-background/90 backdrop-blur-sm border-primary/30 text-primary hover:bg-primary/10"
              >
                {isRotating ? '⏸️ Pausa' : '▶️ Ruota'}
              </Button>
            </div>

            {/* Istruzioni */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-background/90 backdrop-blur-sm border border-border/50 text-foreground p-4 rounded-xl text-center shadow-lg">
              <p className="text-sm font-medium">🖱️ Trascina per ruotare il globo • 🎯 Clicca sui paesi colorati per esplorare</p>
            </div>
          </div>

          {/* Country Info Panel */}
          {selectedCountry && (
            <Card className="p-8 max-w-lg bg-gradient-to-br from-background/95 to-primary/5 border-primary/20 shadow-hero backdrop-blur-sm animate-fade-up">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MapPin className="w-7 h-7 text-primary" />
                  <h3 className="text-3xl font-bold text-foreground">{selectedCountry.name}</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSelectedCountry(null)}
                  className="hover:bg-primary/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-semibold text-primary uppercase tracking-wide">Capitale</label>
                  <p className="text-xl text-foreground font-medium">{selectedCountry.capital}</p>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-primary uppercase tracking-wide">Popolazione</label>
                  <p className="text-xl text-foreground font-medium">{selectedCountry.population}</p>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-primary uppercase tracking-wide">Descrizione</label>
                  <p className="text-foreground leading-relaxed text-lg">{selectedCountry.description}</p>
                </div>
                
                <Button className="w-full mt-8 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-6 text-lg shadow-lg">
                  🌍 Scopri Esperienze in {selectedCountry.name}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};