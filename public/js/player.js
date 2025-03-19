// Player class for handling player movement, physics, and interactions
import * as THREE from 'three';

export class Player {
    constructor(scene, camera, controls, id = null) {
        this.scene = scene;
        this.camera = camera;
        this.controls = controls;
        this.id = id;
        
        // Player state
        this.position = new THREE.Vector3(0, 1.6, 0);
        this.velocity = new THREE.Vector3();
        this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = true;
        this.team = 'runner';
        this.health = 100;
        
        // Player settings
        this.height = 1.6;
        this.speed = 10.0;
        this.jumpHeight = 20.0;
        
        // Create player model
        this.createPlayerModel();
    }
    
    createPlayerModel() {
        // Only create visible model for other players
        if (this.id !== null) {
            // Create player body
            const geometry = new THREE.CapsuleGeometry(0.5, 1.0, 4, 8);
            const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
            this.model = new THREE.Mesh(geometry, material);
            this.model.position.copy(this.position);
            this.model.castShadow = true;
            this.model.receiveShadow = true;
            
            // Add to scene
            this.scene.add(this.model);
            
            // Create player name tag
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 64;
            context.font = '24px Arial';
            context.fillStyle = 'white';
            context.textAlign = 'center';
            context.fillText(this.id, 128, 24);
            
            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
            this.nameTag = new THREE.Sprite(spriteMaterial);
            this.nameTag.position.set(0, 1.5, 0);
            this.nameTag.scale.set(2, 0.5, 1);
            
            this.model.add(this.nameTag);
        }
    }
    
    update(delta) {
        // Apply gravity
        this.velocity.y -= 9.8 * delta;
        
        // Apply movement
        const moveSpeed = this.speed * delta;
        
        if (this.controls) {
            // First-person movement
            const direction = new THREE.Vector3();
            
            if (this.moveForward) {
                direction.z = -1;
            }
            if (this.moveBackward) {
                direction.z = 1;
            }
            if (this.moveLeft) {
                direction.x = -1;
            }
            if (this.moveRight) {
                direction.x = 1;
            }
            
            // Normalize direction
            if (direction.length() > 0) {
                direction.normalize();
            }
            
            // Apply direction to velocity
            this.velocity.x = direction.x * moveSpeed;
            this.velocity.z = direction.z * moveSpeed;
            
            // Apply rotation from camera
            direction.applyEuler(this.camera.rotation);
            
            // Move player
            this.controls.moveRight(this.velocity.x);
            this.controls.moveForward(-this.velocity.z);
            
            // Update position from controls
            this.position.copy(this.camera.position);
        } else if (this.model) {
            // Update model position
            this.model.position.x += this.velocity.x;
            this.model.position.y += this.velocity.y * delta;
            this.model.position.z += this.velocity.z;
            
            // Update model rotation
            this.model.rotation.y = this.rotation.y;
            
            // Update position from model
            this.position.copy(this.model.position);
            
            // Check for ground collision
            if (this.position.y < this.height) {
                this.velocity.y = 0;
                this.position.y = this.height;
                this.canJump = true;
                
                if (this.model) {
                    this.model.position.y = this.height;
                }
            }
        }
    }
    
    jump() {
        if (this.canJump) {
            this.velocity.y = this.jumpHeight;
            this.canJump = false;
        }
    }
    
    teleport(position) {
        // Update position
        this.position.copy(position);
        
        // Update camera or model
        if (this.camera) {
            this.camera.position.copy(position);
        } else if (this.model) {
            this.model.position.copy(position);
        }
        
        // Create teleport effect
        this.createTeleportEffect(position);
    }
    
    createTeleportEffect(position) {
        // Create particles
        const particleCount = 100;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = position.x + (Math.random() - 0.5) * 2;
            positions[i3 + 1] = position.y + (Math.random() - 0.5) * 2;
            positions[i3 + 2] = position.z + (Math.random() - 0.5) * 2;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0x00ffff,
            size: 0.1,
            transparent: true,
            opacity: 1
        });
        
        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
        
        // Animate particles
        const startTime = Date.now();
        
        const animate = () => {
            const elapsedTime = Date.now() - startTime;
            
            if (elapsedTime < 1000) {
                // Update particle positions
                const positions = particles.geometry.attributes.position.array;
                
                for (let i = 0; i < particleCount; i++) {
                    const i3 = i * 3;
                    positions[i3] += (Math.random() - 0.5) * 0.1;
                    positions[i3 + 1] += (Math.random() - 0.5) * 0.1;
                    positions[i3 + 2] += (Math.random() - 0.5) * 0.1;
                }
                
                particles.geometry.attributes.position.needsUpdate = true;
                
                // Update opacity
                material.opacity = 1 - (elapsedTime / 1000);
                
                requestAnimationFrame(animate);
            } else {
                // Remove particles
                this.scene.remove(particles);
            }
        };
        
        animate();
    }
    
    rotateY(angle) {
        this.rotation.y += angle;
        
        if (this.model) {
            this.model.rotation.y = this.rotation.y;
        }
    }
    
    setSkin(skin) {
        if (this.model) {
            // Remove old model
            this.scene.remove(this.model);
            
            // Create new model based on skin
            let color;
            
            switch (skin) {
                case '1':
                    color = 0xff0000; // Red
                    break;
                case '2':
                    color = 0x00ff00; // Green
                    break;
                case '3':
                    color = 0x0000ff; // Blue
                    break;
                case '4':
                    color = 0xffff00; // Yellow
                    break;
                case '5':
                    color = 0xff00ff; // Purple
                    break;
                default:
                    color = 0xffffff; // White
            }
            
            const geometry = new THREE.CapsuleGeometry(0.5, 1.0, 4, 8);
            const material = new THREE.MeshLambertMaterial({ color: color });
            this.model = new THREE.Mesh(geometry, material);
            this.model.position.copy(this.position);
            this.model.rotation.y = this.rotation.y;
            this.model.castShadow = true;
            this.model.receiveShadow = true;
            
            // Add to scene
            this.scene.add(this.model);
            
            // Add name tag
            if (this.nameTag) {
                this.model.add(this.nameTag);
            }
        }
    }
    
    setTeam(team) {
        this.team = team;
        
        if (this.model) {
            // Update model color based on team
            const material = this.model.material;
            
            if (team === 'tagger') {
                material.color.setHex(0xff0000); // Red for taggers
            } else {
                material.color.setHex(0x0000ff); // Blue for runners
            }
        }
    }
    
    setHealth(health) {
        this.health = health;
    }
    
    getPosition() {
        return this.position.clone();
    }
    
    getRotation() {
        return this.rotation.clone();
    }
    
    getTeam() {
        return this.team;
    }
    
    getHealth() {
        return this.health;
    }
    
    updatePosition(position, rotation) {
        // Update position
        this.position.copy(position);
        
        // Update rotation
        this.rotation.copy(rotation);
        
        // Update model
        if (this.model) {
            this.model.position.copy(position);
            this.model.rotation.y = rotation.y;
        }
    }
    
    remove() {
        if (this.model) {
            this.scene.remove(this.model);
            this.model = null;
        }
    }
}
