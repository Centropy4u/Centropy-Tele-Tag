// Day/Night cycle class for managing lighting and sky changes
import * as THREE from 'three';

export class DayNightCycle {
    constructor(scene, sunLight) {
        this.scene = scene;
        this.sunLight = sunLight;
        
        // Cycle settings
        this.cycleLength = 300; // 5 minutes for a full day/night cycle
        this.timeOfDay = 0; // 0 = noon, 0.5 = midnight
        
        // Create sky
        this.createSky();
    }
    
    createSky() {
        // Create sky dome
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        // Flip the geometry inside out
        skyGeometry.scale(-1, 1, 1);
        
        // Create sky material
        this.skyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x0077ff) },
                bottomColor: { value: new THREE.Color(0xffffff) },
                offset: { value: 33 },
                exponent: { value: 0.6 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
                }
            `,
            side: THREE.BackSide
        });
        
        // Create sky mesh
        this.sky = new THREE.Mesh(skyGeometry, this.skyMaterial);
        this.scene.add(this.sky);
        
        // Create stars
        this.createStars();
    }
    
    createStars() {
        // Create star particles
        const starCount = 1000;
        const starGeometry = new THREE.BufferGeometry();
        const starPositions = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            // Position stars in a sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            const radius = 450 + Math.random() * 50;
            
            starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            starPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            starPositions[i3 + 2] = radius * Math.cos(phi);
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        
        // Create star material
        this.starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1,
            transparent: true,
            opacity: 0,
            sizeAttenuation: false
        });
        
        // Create star particles
        this.stars = new THREE.Points(starGeometry, this.starMaterial);
        this.scene.add(this.stars);
    }
    
    update(delta) {
        // Update time of day
        this.timeOfDay = (this.timeOfDay + delta / this.cycleLength) % 1;
        
        // Calculate sun position
        const sunAngle = this.timeOfDay * Math.PI * 2;
        const sunRadius = 100;
        const sunX = Math.cos(sunAngle) * sunRadius;
        const sunY = Math.sin(sunAngle) * sunRadius;
        
        // Update sun position
        this.sunLight.position.set(sunX, sunY, 50);
        
        // Update sun intensity based on time of day
        const dayFactor = Math.max(0, Math.sin(sunAngle));
        this.sunLight.intensity = dayFactor;
        
        // Update sky colors based on time of day
        if (dayFactor > 0.3) {
            // Day
            this.skyMaterial.uniforms.topColor.value.setRGB(0, 0.47, 1);
            this.skyMaterial.uniforms.bottomColor.value.setRGB(1, 1, 1);
        } else if (dayFactor > 0) {
            // Sunrise/Sunset
            const t = dayFactor / 0.3;
            const sunsetColor = new THREE.Color(1, 0.5, 0);
            const dayColor = new THREE.Color(0, 0.47, 1);
            const skyColor = new THREE.Color();
            skyColor.lerpColors(sunsetColor, dayColor, t);
            
            this.skyMaterial.uniforms.topColor.value.copy(skyColor);
            this.skyMaterial.uniforms.bottomColor.value.setRGB(1, 1 - 0.5 * t, 0.5 - 0.5 * t);
        } else {
            // Night
            this.skyMaterial.uniforms.topColor.value.setRGB(0, 0, 0.1);
            this.skyMaterial.uniforms.bottomColor.value.setRGB(0, 0, 0.05);
        }
        
        // Update star visibility
        this.starMaterial.opacity = Math.max(0, 0.8 - dayFactor * 2);
        
        // Update fog color based on time of day
        if (this.scene.fog) {
            if (dayFactor > 0.3) {
                // Day
                this.scene.fog.color.setRGB(0.8, 0.8, 0.8);
            } else if (dayFactor > 0) {
                // Sunrise/Sunset
                const t = dayFactor / 0.3;
                this.scene.fog.color.setRGB(0.8 * t, 0.5 * t, 0.5 * t);
            } else {
                // Night
                this.scene.fog.color.setRGB(0, 0, 0.05);
            }
        }
    }
    
    getTimeOfDay() {
        return this.timeOfDay;
    }
    
    setTimeOfDay(time) {
        this.timeOfDay = time % 1;
    }
}
