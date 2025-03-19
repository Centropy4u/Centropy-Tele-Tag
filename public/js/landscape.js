// Landscape class for creating and managing different landscapes
import * as THREE from 'three';

export class Landscape {
    constructor(scene) {
        this.scene = scene;
        
        // Landscape types
        this.landscapes = {
            savannah: null,
            forest: null,
            himalaya: null
        };
        
        // Current landscape
        this.currentLandscape = 'savannah';
        
        // Transition state
        this.transitioning = false;
        this.transitionProgress = 0;
        this.transitionFrom = null;
        this.transitionTo = null;
        
        // Create landscapes
        this.createSavannah();
        this.createForest();
        this.createHimalaya();
        
        // Show initial landscape
        this.showLandscape(this.currentLandscape);
    }
    
    createSavannah() {
        // Create savannah landscape
        const landscape = new THREE.Group();
        
        // Ground
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0xd2b48c });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        landscape.add(ground);
        
        // Add trees (acacia-like)
        for (let i = 0; i < 50; i++) {
            const tree = this.createAcaciaTree();
            tree.position.set(
                (Math.random() - 0.5) * 800,
                0,
                (Math.random() - 0.5) * 800
            );
            landscape.add(tree);
        }
        
        // Add rocks
        for (let i = 0; i < 100; i++) {
            const rock = this.createRock();
            rock.position.set(
                (Math.random() - 0.5) * 800,
                0,
                (Math.random() - 0.5) * 800
            );
            landscape.add(rock);
        }
        
        // Add grass tufts
        for (let i = 0; i < 500; i++) {
            const grass = this.createGrassTuft();
            grass.position.set(
                (Math.random() - 0.5) * 800,
                0,
                (Math.random() - 0.5) * 800
            );
            landscape.add(grass);
        }
        
        // Store landscape
        this.landscapes.savannah = landscape;
    }
    
    createForest() {
        // Create forest landscape
        const landscape = new THREE.Group();
        
        // Ground
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x355e3b });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        landscape.add(ground);
        
        // Add trees (pine-like)
        for (let i = 0; i < 200; i++) {
            const tree = this.createPineTree();
            tree.position.set(
                (Math.random() - 0.5) * 800,
                0,
                (Math.random() - 0.5) * 800
            );
            landscape.add(tree);
        }
        
        // Add rocks
        for (let i = 0; i < 50; i++) {
            const rock = this.createRock();
            rock.position.set(
                (Math.random() - 0.5) * 800,
                0,
                (Math.random() - 0.5) * 800
            );
            landscape.add(rock);
        }
        
        // Add mushrooms
        for (let i = 0; i < 100; i++) {
            const mushroom = this.createMushroom();
            mushroom.position.set(
                (Math.random() - 0.5) * 800,
                0,
                (Math.random() - 0.5) * 800
            );
            landscape.add(mushroom);
        }
        
        // Store landscape
        this.landscapes.forest = landscape;
    }
    
    createHimalaya() {
        // Create himalaya landscape
        const landscape = new THREE.Group();
        
        // Ground (snow)
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        landscape.add(ground);
        
        // Add mountains
        for (let i = 0; i < 20; i++) {
            const mountain = this.createMountain();
            mountain.position.set(
                (Math.random() - 0.5) * 800,
                0,
                (Math.random() - 0.5) * 800
            );
            landscape.add(mountain);
        }
        
        // Add ice rocks
        for (let i = 0; i < 100; i++) {
            const rock = this.createIceRock();
            rock.position.set(
                (Math.random() - 0.5) * 800,
                0,
                (Math.random() - 0.5) * 800
            );
            landscape.add(rock);
        }
        
        // Add snow piles
        for (let i = 0; i < 200; i++) {
            const snowPile = this.createSnowPile();
            snowPile.position.set(
                (Math.random() - 0.5) * 800,
                0,
                (Math.random() - 0.5) * 800
            );
            landscape.add(snowPile);
        }
        
        // Store landscape
        this.landscapes.himalaya = landscape;
    }
    
    createAcaciaTree() {
        const tree = new THREE.Group();
        
        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.4, 5, 8);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 2.5;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        tree.add(trunk);
        
        // Canopy (flat top)
        const canopyGeometry = new THREE.CylinderGeometry(4, 4, 1, 8);
        const canopyMaterial = new THREE.MeshLambertMaterial({ color: 0x556b2f });
        const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
        canopy.position.y = 5.5;
        canopy.castShadow = true;
        canopy.receiveShadow = true;
        tree.add(canopy);
        
        return tree;
    }
    
    createPineTree() {
        const tree = new THREE.Group();
        
        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.4, 5, 8);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 2.5;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        tree.add(trunk);
        
        // Canopy (cone)
        const canopyGeometry = new THREE.ConeGeometry(2, 8, 8);
        const canopyMaterial = new THREE.MeshLambertMaterial({ color: 0x006400 });
        const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
        canopy.position.y = 8;
        canopy.castShadow = true;
        canopy.receiveShadow = true;
        tree.add(canopy);
        
        return tree;
    }
    
    createRock() {
        const rockGeometry = new THREE.DodecahedronGeometry(Math.random() * 0.5 + 0.5, 0);
        const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.y = rock.geometry.parameters.radius / 2;
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        rock.castShadow = true;
        rock.receiveShadow = true;
        
        return rock;
    }
    
    createGrassTuft() {
        const grassGeometry = new THREE.ConeGeometry(0.2, 0.5, 4);
        const grassMaterial = new THREE.MeshLambertMaterial({ color: 0x90ee90 });
        const grass = new THREE.Mesh(grassGeometry, grassMaterial);
        grass.position.y = 0.25;
        grass.castShadow = true;
        grass.receiveShadow = true;
        
        return grass;
    }
    
    createMushroom() {
        const mushroom = new THREE.Group();
        
        // Stem
        const stemGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 8);
        const stemMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 0.15;
        stem.castShadow = true;
        stem.receiveShadow = true;
        mushroom.add(stem);
        
        // Cap
        const capGeometry = new THREE.SphereGeometry(0.2, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const capMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
        const cap = new THREE.Mesh(capGeometry, capMaterial);
        cap.position.y = 0.3;
        cap.castShadow = true;
        cap.receiveShadow = true;
        mushroom.add(cap);
        
        return mushroom;
    }
    
    createMountain() {
        const mountainGeometry = new THREE.ConeGeometry(Math.random() * 20 + 10, Math.random() * 30 + 20, 8);
        const mountainMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
        mountain.position.y = mountainGeometry.parameters.height / 2;
        mountain.castShadow = true;
        mountain.receiveShadow = true;
        
        return mountain;
    }
    
    createIceRock() {
        const rockGeometry = new THREE.DodecahedronGeometry(Math.random() * 0.5 + 0.5, 0);
        const rockMaterial = new THREE.MeshLambertMaterial({ color: 0xadd8e6, transparent: true, opacity: 0.8 });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.y = rock.geometry.parameters.radius / 2;
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        rock.castShadow = true;
        rock.receiveShadow = true;
        
        return rock;
    }
    
    createSnowPile() {
        const snowGeometry = new THREE.SphereGeometry(Math.random() * 0.5 + 0.5, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const snowMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const snow = new THREE.Mesh(snowGeometry, snowMaterial);
        snow.position.y = snowGeometry.parameters.radius / 2;
        snow.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        snow.castShadow = true;
        snow.receiveShadow = true;
        
        return snow;
    }
    
    showLandscape(type) {
        // Hide all landscapes
        for (const key in this.landscapes) {
            if (this.landscapes[key]) {
                this.scene.remove(this.landscapes[key]);
            }
        }
        
        // Show selected landscape
        if (this.landscapes[type]) {
            this.scene.add(this.landscapes[type]);
            this.currentLandscape = type;
        }
    }
    
    transitionTo(type, duration = 5) {
        if (this.currentLandscape === type || this.transitioning) {
            return;
        }
        
        // Start transition
        this.transitioning = true;
        this.transitionProgress = 0;
        this.transitionFrom = this.currentLandscape;
        this.transitionTo = type;
        this.transitionDuration = duration;
        
        // Show both landscapes
        if (this.landscapes[this.transitionFrom]) {
            this.scene.add(this.landscapes[this.transitionFrom]);
        }
        if (this.landscapes[this.transitionTo]) {
            this.scene.add(this.landscapes[this.transitionTo]);
            
            // Position the target landscape below the current one
            this.landscapes[this.transitionTo].position.y = -100;
        }
    }
    
    update(delta) {
        if (this.transitioning) {
            // Update transition progress
            this.transitionProgress += delta / this.transitionDuration;
            
            if (this.transitionProgress >= 1) {
                // Transition complete
                this.transitioning = false;
                this.showLandscape(this.transitionTo);
            } else {
                // Update landscape positions
                if (this.landscapes[this.transitionFrom]) {
                    this.landscapes[this.transitionFrom].position.y = this.transitionProgress * 100;
                }
                if (this.landscapes[this.transitionTo]) {
                    this.landscapes[this.transitionTo].position.y = -100 + this.transitionProgress * 100;
                }
            }
        }
    }
    
    getCurrentLandscape() {
        return this.currentLandscape;
    }
    
    getNextLandscape() {
        // Cycle through landscapes
        const landscapes = Object.keys(this.landscapes);
        const currentIndex = landscapes.indexOf(this.currentLandscape);
        const nextIndex = (currentIndex + 1) % landscapes.length;
        
        return landscapes[nextIndex];
    }
}
