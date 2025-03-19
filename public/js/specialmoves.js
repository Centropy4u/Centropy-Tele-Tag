// Special moves class for managing player special abilities
import * as THREE from 'three';

export class SpecialMoves {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        
        // Active special moves
        this.activeMoves = {};
        
        // Cooldowns
        this.cooldowns = {
            '1': 0, // Speed Boost
            '2': 0, // High Jump
            '3': 0, // Invisibility
            '4': 0, // Freeze Ray
            '5': 0, // Shield
            '6': 0  // Decoy
        };
        
        // Cooldown durations (in seconds)
        this.cooldownDurations = {
            '1': 10, // Speed Boost
            '2': 5,  // High Jump
            '3': 15, // Invisibility
            '4': 8,  // Freeze Ray
            '5': 12, // Shield
            '6': 15  // Decoy
        };
        
        // Effect durations (in seconds)
        this.effectDurations = {
            '1': 5,  // Speed Boost
            '2': 0,  // High Jump (instant)
            '3': 8,  // Invisibility
            '4': 0,  // Freeze Ray (instant)
            '5': 6,  // Shield
            '6': 10  // Decoy
        };
    }
    
    activateMove(moveType) {
        // Check if move is on cooldown
        if (this.cooldowns[moveType] > 0) {
            console.log(`Special move ${moveType} is on cooldown: ${this.cooldowns[moveType].toFixed(1)}s`);
            return false;
        }
        
        // Activate move
        switch (moveType) {
            case '1':
                this.activateSpeedBoost();
                break;
            case '2':
                this.activateHighJump();
                break;
            case '3':
                this.activateInvisibility();
                break;
            case '4':
                this.activateFreezeRay();
                break;
            case '5':
                this.activateShield();
                break;
            case '6':
                this.activateDecoy();
                break;
            default:
                console.log(`Unknown special move: ${moveType}`);
                return false;
        }
        
        // Set cooldown
        this.cooldowns[moveType] = this.cooldownDurations[moveType];
        
        // Set active move timer if it has a duration
        if (this.effectDurations[moveType] > 0) {
            this.activeMoves[moveType] = this.effectDurations[moveType];
        }
        
        return true;
    }
    
    update(delta) {
        // Update cooldowns
        for (const moveType in this.cooldowns) {
            if (this.cooldowns[moveType] > 0) {
                this.cooldowns[moveType] -= delta;
                if (this.cooldowns[moveType] < 0) {
                    this.cooldowns[moveType] = 0;
                }
            }
        }
        
        // Update active moves
        for (const moveType in this.activeMoves) {
            this.activeMoves[moveType] -= delta;
            
            if (this.activeMoves[moveType] <= 0) {
                // Deactivate move
                this.deactivateMove(moveType);
                delete this.activeMoves[moveType];
            }
        }
    }
    
    activateSpeedBoost() {
        console.log('Activating Speed Boost');
        
        // Store original speed
        this.originalSpeed = this.player.speed;
        
        // Increase player speed
        this.player.speed *= 2;
        
        // Create speed effect
        this.createSpeedEffect();
    }
    
    deactivateSpeedBoost() {
        console.log('Deactivating Speed Boost');
        
        // Restore original speed
        if (this.originalSpeed) {
            this.player.speed = this.originalSpeed;
            this.originalSpeed = null;
        }
        
        // Remove speed effect
        if (this.speedEffect) {
            this.scene.remove(this.speedEffect);
            this.speedEffect = null;
        }
    }
    
    createSpeedEffect() {
        // Create particle effect
        const particleCount = 50;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 2;
            positions[i3 + 1] = (Math.random() - 0.5) * 2;
            positions[i3 + 2] = (Math.random() - 0.5) * 2;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0x00ffff,
            size: 0.1,
            transparent: true,
            opacity: 0.8
        });
        
        this.speedEffect = new THREE.Points(geometry, material);
        this.player.model.add(this.speedEffect);
    }
    
    activateHighJump() {
        console.log('Activating High Jump');
        
        // Apply extra jump force
        this.player.velocity.y += 20;
        
        // Create jump effect
        this.createJumpEffect();
    }
    
    createJumpEffect() {
        // Create ring effect at player's feet
        const geometry = new THREE.RingGeometry(0, 2, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        const ring = new THREE.Mesh(geometry, material);
        ring.rotation.x = Math.PI / 2;
        ring.position.copy(this.player.getPosition());
        this.scene.add(ring);
        
        // Animate ring
        const startTime = Date.now();
        
        const animate = () => {
            const elapsedTime = Date.now() - startTime;
            
            if (elapsedTime < 1000) {
                // Scale ring
                ring.scale.set(1 + elapsedTime / 500, 1 + elapsedTime / 500, 1);
                
                // Fade ring
                material.opacity = 0.8 * (1 - elapsedTime / 1000);
                
                requestAnimationFrame(animate);
            } else {
                // Remove ring
                this.scene.remove(ring);
            }
        };
        
        animate();
    }
    
    activateInvisibility() {
        console.log('Activating Invisibility');
        
        // Store original opacity
        if (this.player.model) {
            this.originalOpacity = this.player.model.material.opacity;
            
            // Make player transparent
            this.player.model.material.transparent = true;
            this.player.model.material.opacity = 0.2;
        }
        
        // Create invisibility effect
        this.createInvisibilityEffect();
    }
    
    deactivateInvisibility() {
        console.log('Deactivating Invisibility');
        
        // Restore original opacity
        if (this.player.model && this.originalOpacity !== undefined) {
            this.player.model.material.opacity = this.originalOpacity;
            this.player.model.material.transparent = this.originalOpacity < 1;
            this.originalOpacity = undefined;
        }
        
        // Remove invisibility effect
        if (this.invisibilityEffect) {
            this.player.model.remove(this.invisibilityEffect);
            this.invisibilityEffect = null;
        }
    }
    
    createInvisibilityEffect() {
        // Create shimmer effect
        const particleCount = 100;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 2;
            positions[i3 + 1] = (Math.random() - 0.5) * 4;
            positions[i3 + 2] = (Math.random() - 0.5) * 2;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.05,
            transparent: true,
            opacity: 0.5
        });
        
        this.invisibilityEffect = new THREE.Points(geometry, material);
        
        if (this.player.model) {
            this.player.model.add(this.invisibilityEffect);
        }
    }
    
    activateFreezeRay() {
        console.log('Activating Freeze Ray');
        
        // Create ray from player's position in the direction they're facing
        const rayStart = this.player.getPosition();
        const rayDirection = new THREE.Vector3(0, 0, -1);
        rayDirection.applyEuler(this.player.getRotation());
        
        // Create visual effect
        this.createFreezeRayEffect(rayStart, rayDirection);
        
        // The actual freezing of other players would be handled by the server
    }
    
    createFreezeRayEffect(start, direction) {
        // Create beam effect
        const beamLength = 20;
        const beamGeometry = new THREE.CylinderGeometry(0.1, 0.1, beamLength, 8);
        beamGeometry.rotateX(Math.PI / 2);
        beamGeometry.translate(0, 0, -beamLength / 2);
        
        const beamMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.7
        });
        
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.position.copy(start);
        beam.position.y += 1; // Adjust to eye level
        
        // Set beam direction
        beam.lookAt(start.clone().add(direction.clone().multiplyScalar(10)));
        
        this.scene.add(beam);
        
        // Animate beam
        const startTime = Date.now();
        
        const animate = () => {
            const elapsedTime = Date.now() - startTime;
            
            if (elapsedTime < 500) {
                // Fade beam
                beamMaterial.opacity = 0.7 * (1 - elapsedTime / 500);
                
                requestAnimationFrame(animate);
            } else {
                // Remove beam
                this.scene.remove(beam);
            }
        };
        
        animate();
    }
    
    activateShield() {
        console.log('Activating Shield');
        
        // Create shield effect
        this.createShieldEffect();
    }
    
    deactivateShield() {
        console.log('Deactivating Shield');
        
        // Remove shield effect
        if (this.shieldEffect) {
            this.scene.remove(this.shieldEffect);
            this.shieldEffect = null;
        }
    }
    
    createShieldEffect() {
        // Create sphere around player
        const geometry = new THREE.SphereGeometry(2, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0x4444ff,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        this.shieldEffect = new THREE.Mesh(geometry, material);
        this.shieldEffect.position.copy(this.player.getPosition());
        this.scene.add(this.shieldEffect);
    }
    
    activateDecoy() {
        console.log('Activating Decoy');
        
        // Create decoy at player's position
        const decoyPosition = this.player.getPosition().clone();
        
        // Create decoy model
        this.createDecoyEffect(decoyPosition);
    }
    
    createDecoyEffect(position) {
        // Create decoy model (similar to player)
        const geometry = new THREE.CapsuleGeometry(0.5, 1.0, 4, 8);
        const material = new THREE.MeshLambertMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.7
        });
        
        const decoy = new THREE.Mesh(geometry, material);
        decoy.position.copy(position);
        decoy.castShadow = true;
        decoy.receiveShadow = true;
        
        this.scene.add(decoy);
        
        // Animate decoy
        const startTime = Date.now();
        const duration = 10000; // 10 seconds
        
        const animate = () => {
            const elapsedTime = Date.now() - startTime;
            
            if (elapsedTime < duration) {
                // Make decoy float up and down
                decoy.position.y = position.y + Math.sin(elapsedTime / 500) * 0.2;
                
                // Rotate decoy
                decoy.rotation.y += 0.01;
                
                // Fade decoy near the end
                if (elapsedTime > duration - 2000) {
                    material.opacity = 0.7 * (1 - (elapsedTime - (duration - 2000)) / 2000);
                }
                
                requestAnimationFrame(animate);
            } else {
                // Remove decoy
                this.scene.remove(decoy);
            }
        };
        
        animate();
    }
    
    deactivateMove(moveType) {
        switch (moveType) {
            case '1':
                this.deactivateSpeedBoost();
                break;
            case '3':
                this.deactivateInvisibility();
                break;
            case '5':
                this.deactivateShield();
                break;
            // Other moves don't need deactivation as they're instant or self-managed
        }
    }
    
    getCooldown(moveType) {
        return this.cooldowns[moveType];
    }
    
    getActiveMoves() {
        return Object.keys(this.activeMoves);
    }
}
