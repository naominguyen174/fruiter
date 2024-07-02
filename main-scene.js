import { defs, tiny } from './examples/common.js';
import { Axes_Viewer, Axes_Viewer_Test_Scene } from "./examples/axes-viewer.js";
import { Collision_Demo, Inertia_Demo } from './examples/collisions-demo.js';
import { Many_Lights_Demo } from './examples/many-lights-demo.js';
import { Obj_File_Demo } from './examples/obj-file-demo.js';
import { Scene_To_Texture_Demo } from './examples/scene-to-texture-demo.js';
import { Surfaces_Demo } from './examples/surfaces-demo.js';
import { Text_Demo, Text_Line } from './examples/text-demo.js';
import { Transforms_Sandbox } from './examples/transforms-sandbox.js';

// Pull these names into this module's scope for convenience:
const {
    Vector, Vector3, vec, vec3, vec4, color, Matrix, Mat4, Light, Shape, Material, Shader, Texture, Scene,
    Canvas_Widget, Code_Widget, Text_Widget, hex_color
} = tiny;

const { Textured_Phong } = defs;
// Define the new scene class for the ball bouncing animation
class Fruiter extends Scene {
    constructor() {
        super();

        this.shapes = {
            grape: new defs.Subdivision_Sphere(4),
            blueberry: new defs.Subdivision_Sphere(4),
            kiwi: new defs.Subdivision_Sphere(4),
            pear: new defs.Subdivision_Sphere(4),
            apple: new defs.Subdivision_Sphere(4),
            mango: new defs.Subdivision_Sphere(4),
            orange: new defs.Subdivision_Sphere(4),
            melon: new defs.Subdivision_Sphere(4),
            coconut: new defs.Subdivision_Sphere(4),
            watermelon: new defs.Subdivision_Sphere(4),
            small_cube: new defs.Cube(),
            large_cube: new defs.Cube(),
            floor: new defs.Cube(),
            wall: new defs.Cube(),
            line: new defs.Cube(),
            shadow: new defs.Subdivision_Sphere(4),
            losstimer: new defs.Cube(),
            text: new Text_Line(35),
        };

        this.materials = {
            grape: new Material(new Textured_Phong(1), { ambient: 1, color: color(0, 0, 0, 1), texture: new Texture("assets/grape.png") }),
            blueberry: new Material(new Textured_Phong(1), { ambient: 1, color: color(0, 0, 0, 1), texture: new Texture("assets/blueberry.png") }), // Blue
            kiwi: new Material(new Textured_Phong(1), { ambient: 1, color: color(0, 0, 0, 1), texture: new Texture("assets/kiwi.jpeg") }), // Brown
            pear: new Material(new Textured_Phong(1), { ambient: 1, color: color(0, 0, 0, 1), texture: new Texture("assets/pear.jpeg") }),
            apple: new Material(new Textured_Phong(1), { ambient: 1, color: color(0, 0, 0, 1), texture: new Texture("assets/apple.jpeg") }), // Red
            mango: new Material(new Textured_Phong(1), { ambient: 1, color: color(0, 0, 0, 1), texture: new Texture("assets/mango.jpeg") }),
            orange: new Material(new Textured_Phong(1), { ambient: 1, color: color(0, 0, 0, 1), texture: new Texture("assets/orange.jpeg") }), // Orange
            melon: new Material(new Textured_Phong(1), { ambient: 1, color: color(0, 0, 0, 1), texture: new Texture("assets/melon.jpeg") }),
            coconut: new Material(new Textured_Phong(1), { ambient: 1, color: color(0, 0, 0, 1), texture: new Texture("assets/coconut.jpeg") }),
            watermelon: new Material(new Textured_Phong(1), { ambient: 1, color: color(0, 0, 0, 1), texture: new Texture("assets/watermelon.jpeg") }), // Green
            floor: new Material(new Textured_Phong(1), { ambient: 1, color: color(0, 0, 0, 1), texture: new Texture("assets/fruitbasket.jpeg") }), // Grey
            wall: new Material(new Textured_Phong(1), { ambient: 1, color: color(0, 0, 0, 1), texture: new Texture("assets/fruitbasket.jpeg") }),
            line: new Material(new defs.Phong_Shader(), {
                ambient: 1, diffusivity: 0, specularity: 0, color: color(1, 1, 1, 1)  // White color
            }),
            shadow: new Material(new defs.Phong_Shader(), {
                ambient: 0.5, diffusivity: 0.5, color: color(0.2, 0.2, 0.2, 1)
            }),
            small_cube: new Material(new defs.Phong_Shader(), { color: color(1, 1, 1, 1) }),
            large_cube: new Material(new defs.Phong_Shader(), { color: color(1, 1, 1, 1) }),
            losstimer: new Material(new defs.Phong_Shader(), {
                color: color(1, 0, 0, 1)
            }),
            text_image: new Material(new defs.Textured_Phong(), { // COPIED FROM FOLDER EXAMPLES/TEXT-DEMO
                ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("/assets/bitmap.png") // CREDIT/CITE bitmap found from google images, https://docs.rs/bitmap-font/latest/bitmap_font/tamzen/index.html
            }),

            game_over: new Material(new defs.Phong_Shader(), {
                ambient: 1, diffusivity: 0, specularity: 0, color: color(1, 0, 0, 1) // Red color
            }),

        };

        // Initial variables setup
        this.xDrop = 0; // x value when dropped
        this.dropped = false;
        this.pre_drop_position = vec3(0, 10, 0); // Initial pre-drop position

        this.fruits = [];
        this.gravity = vec3(0, -9.8, 0); // Gravity vector
        this.floor_y = -2;

        this.previoust = 0; // check time for loss condition
        this.losing = 0; // timer for loss condition, if losing > 5 then game ends 

        this.canDrop = true; // can it drop ? 
        this.dropTimer = 0;
        this.dropTimerToggle = true;

        this.GameLost = false;

        this.score = 0;
        this.update_score();
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
        this.drop_count = 0; // Initialize drop count to 0
        // Define the types of fruits that can be randomly spawned
        this.fruit_types = [
            { shape: 'grape', material: 'grape', radius: 0.75 },
            { shape: 'blueberry', material: 'blueberry', radius: 1 },
            { shape: 'kiwi', material: 'kiwi', radius: 1.5 },
            //{ shape: 'small_cube', material: 'small_cube', radius: 1 }, // Add small cube
            //{ shape: 'large_cube', material: 'large_cube', radius: 1.5 } // Add large cube
            /*{ shape: 'pear', material: 'pear', radius: 1.75 },
            { shape: 'apple', material: 'apple', radius: 2 },
            { shape: 'mango', material: 'mango', radius: 2.25 },
            { shape: 'orange', material: 'orange', radius: 2.5 },
            { shape: 'melon', material: 'melon', radius: 2.75 },
            { shape: 'coconut', material: 'coconut', radius: 3 },
            { shape: 'watermelon', material: 'watermelon', radius: 3.25 }*/
        ];
        // Generate the initial drop sequence
        this.drop_sequence = this.generate_random_drop(0); // Generate 10 fruits as an example
        this.drop_index = 0;

        // Initialize the next fruit to drop
        this.next_fruit = this.drop_sequence[this.drop_index];

    }


    // Function to generate a random drop sequence
    generate_random_drop(length) {
        const sequence = [{ shape: 'grape', material: 'grape', radius: 0.75 }]; // Always start with a grape
        for (let i = 0; i < length; i++) {
            const random_fruit = this.fruit_types[Math.floor(Math.random() * this.fruit_types.length)];
            sequence.push(random_fruit);
        }
        return sequence;
    }

  



    make_control_panel(program_state) {
        // Implement s to drop
        this.key_triggered_button("Drop", ["s"], () => {
            if (!this.canDrop) {
                console.log(":(");
            } else {
                if (this.next_fruit) {
                    // Drop the next fruit
                    this.fruits.push({
                        position: this.pre_drop_position.copy(),
                        velocity: vec3(0, -1, 0),
                        radius: this.next_fruit.radius,
                        shape: this.next_fruit.shape,
                        material: this.next_fruit.material,
                        rotation: vec3(0, 0, 0)
                    });
                    this.score += 5;
                    this.update_score();
                    this.update_highscore();
                    this.drop_index++;
                    //this.drop_count++;
                    //console.log(`Drop count: ${this.drop_count}`); // Print drop count to console
                    
                }
                //personalized random drop for cube
                // Increase drop count and check if a cube needs to drop
                    this.drop_count++;
                    if (this.drop_count % 25 === 0) {
                        // Drop a small cube
                        this.fruits.push({
                            position: this.pre_drop_position.copy(),
                            velocity: vec3(0, -1, 0),
                            radius: 1, 
                            shape: 'small_cube',
                            material: 'small_cube',
                            rotation: vec3(0, 0, 0)
                        });
                    }
                    if (this.drop_count % 35 === 0) {
                        // Drop a large cube
                        this.fruits.push({
                            position: this.pre_drop_position.copy(),
                            velocity: vec3(0, -1, 0),
                            radius: 1.5, 
                            shape: 'large_cube',
                            material: 'large_cube',
                            rotation: vec3(0, 0, 0)
                        });
                    }
                

                // Update the next fruit
                if (this.drop_index < this.drop_sequence.length) {
                    this.next_fruit = this.drop_sequence[this.drop_index];
                } else {
                    this.next_fruit = this.fruit_types[Math.floor(Math.random() * this.fruit_types.length)];
                }

                // update timer and boolean
                if (this.dropTimerToggle) {
                    this.canDrop = false;
                }
            }
            // Print drop count to console
            console.log(`Drop count: ${this.drop_count}`);
        });

        // Implement 'a' key to move left
        this.key_triggered_button("Left", ["a"], () => {
            if (this.pre_drop_position[0] > -10) {
                this.pre_drop_position[0] -= 1; // Move pre-drop fruit to the left
            }
        });

        // Implement 'd' key to move right
        this.key_triggered_button("Right", ["d"], () => {
            if (this.pre_drop_position[0] < 10) {
                this.pre_drop_position[0] += 1; // Move pre-drop fruit to the right
            }
        });

        //same thing but for down arrow
        this.key_triggered_button("Drop", ["ArrowDown"], () => {
            if (!this.canDrop) {
                console.log(":(");
            } else {
                if (this.next_fruit) {
                    // Drop the next fruit
                    this.fruits.push({
                        position: this.pre_drop_position.copy(),
                        velocity: vec3(0, -1, 0),
                        radius: this.next_fruit.radius,
                        shape: this.next_fruit.shape,
                        material: this.next_fruit.material,
                        rotation: vec3(0, 0, 0)
                    });
                    this.score += 5;
                    this.update_score();
                    this.update_highscore();
                    this.drop_index++;
                    this.drop_count++;
                    console.log(`Drop count: ${this.drop_count}`); // Print drop count to console
                }

                // Increase drop count and check if a cube needs to drop
                    this.drop_count++;
                    if (this.drop_count % 25 === 0) {
                        // Drop a small cube
                        this.fruits.push({
                            position: this.pre_drop_position.copy(),
                            velocity: vec3(0, -1, 0),
                            radius: 1, // Adjust size as needed
                            shape: 'small_cube',
                            material: 'small_cube',
                            rotation: vec3(0, 0, 0)
                        });
                    }
                    if (this.drop_count % 35 === 0) {
                        // Drop a large cube
                        this.fruits.push({
                            position: this.pre_drop_position.copy(),
                            velocity: vec3(0, -1, 0),
                            radius: 1.5, // Adjust size as needed
                            shape: 'large_cube',
                            material: 'large_cube',
                            rotation: vec3(0, 0, 0)
                        });
                    }
                

                // Update the next fruit
                if (this.drop_index < this.drop_sequence.length) {
                    this.next_fruit = this.drop_sequence[this.drop_index];
                } else {
                    this.next_fruit = this.fruit_types[Math.floor(Math.random() * this.fruit_types.length)];
                }

                // update timer and boolean
                if (this.dropTimerToggle) {
                    this.canDrop = false;
                }
            }
        });

        // Implement left arrow key to move left
        this.key_triggered_button("Left", ["ArrowLeft"], () => {
            if (this.pre_drop_position[0] > -10) {
                this.pre_drop_position[0] -= 1; // Move pre-drop fruit to the left
            }
        });

        // Implement right arrow key to move right
        this.key_triggered_button("Right", ["ArrowRight"], () => {
            if (this.pre_drop_position[0] < 10) {
                this.pre_drop_position[0] += 1; // Move pre-drop fruit to the right
            }
        });

        this.key_triggered_button("Fast Mode (Toggle Drop Speed)", ["t"], () => { this.dropTimerToggle = !this.dropTimerToggle });
        this.key_triggered_button("End Game & Start New", ["q"], () => {
            // Reset game variables
            this.score = 0;
            this.update_score();
            this.highScore = parseInt(localStorage.getItem('highScore')) || 0; // Load high score from local storage
            this.fruits = [];
            this.drop_index = 0;
            this.next_fruit = this.drop_sequence[this.drop_index];
            this.pre_drop_position = vec3(0, 10, 0); // Reset pre-drop position
            this.losing = 0; // Reset losing timer
            this.canDrop = true; // Reset drop state
            this.GameLost = false; // Reset game lost state
            this.update_score(); // Update score display
            this.drop_count = 0; // Reset drop count
        });
    }

    // Function to draw the indicator line
    draw_indicator_line(context, program_state) {
        const segment_length = 0.5;  // Length of each segment
        const gap_length = 0.2;      // Length of the gap between segments
        const total_length = this.pre_drop_position[1] - this.floor_y;  // Total length of the line
        const num_segments = Math.floor(total_length / (segment_length + gap_length));  // Number of segments

        for (let i = 0; i < num_segments; i++) {
            const y_position = this.pre_drop_position[1] - i * (segment_length + gap_length) - segment_length / 2;
            const line_transform = Mat4.translation(this.pre_drop_position[0], y_position, this.pre_drop_position[2])
                .times(Mat4.scale(0.05, segment_length / 2, 0.05));  // Scale to make a thin segment

            this.shapes.line.draw(context, program_state, line_transform, this.materials.line);
        }
    }

    check_collision(fruit1, fruit2) {
        const distance = fruit1.position.minus(fruit2.position).norm();
        return distance < (fruit1.radius + fruit2.radius);
    }

    resolve_collision(fruit1, fruit2) {
        const collision_normal = fruit1.position.minus(fruit2.position).normalized();
        const relative_velocity = fruit1.velocity.minus(fruit2.velocity);
        const velocity_along_normal = relative_velocity.dot(collision_normal);

        if (velocity_along_normal > 0) return; // They are moving away from each other

        const restitution = 0.8; // Slightly inelastic collision
        const impulse_scalar = -(1 + restitution) * velocity_along_normal / 2;

        const impulse = collision_normal.times(impulse_scalar);
        fruit1.velocity = fruit1.velocity.plus(impulse);
        fruit2.velocity = fruit2.velocity.minus(impulse);

        // Separate fruits to avoid sinking
        const overlap = (fruit1.radius + fruit2.radius) - fruit1.position.minus(fruit2.position).norm();
        const correction = collision_normal.times(overlap / 2);
        fruit1.position = fruit1.position.plus(correction.times(0.5));
        fruit2.position = fruit2.position.minus(correction.times(0.5));

        // Check if both fruits are large fruits, if so, remove them
        let score_add = 0;
        if (fruit1.shape === 'watermelon' && fruit2.shape === 'watermelon') {
            this.fruits = this.fruits.filter(fruit => fruit !== fruit1 && fruit !== fruit2);
            score_add = 75;
        }

        if (fruit1.shape === 'large_cube' && fruit2.shape === 'large_cube') {
            this.fruits = this.fruits.filter(fruit => fruit !== fruit1 && fruit !== fruit2);
            score_add = 100;
        }

        this.score += score_add;
        this.update_score();
        this.update_highscore();
    }


    merge_fruits(fruit1, fruit2) {
        let new_shape, new_material, new_radius;
        let score_add = 0;
        //this.update_highscore();
        if (fruit1.shape === 'grape' && fruit2.shape === 'grape') {
            new_shape = 'blueberry';
            new_material = 'blueberry';
            new_radius = 1;
            score_add = 10;
        } else if (fruit1.shape === 'blueberry' && fruit2.shape === 'blueberry') {
            new_shape = 'kiwi';
            new_material = 'kiwi';
            new_radius = 1.5;
            score_add = 15;
        } else if (fruit1.shape === 'kiwi' && fruit2.shape === 'kiwi') {
            new_shape = 'pear';
            new_material = 'pear';
            new_radius = 1.75;
            score_add = 20;
        } else if (fruit1.shape === 'pear' && fruit2.shape === 'pear') {
            new_shape = 'apple';
            new_material = 'apple';
            new_radius = 2;
            score_add = 25;
        } else if (fruit1.shape === 'apple' && fruit2.shape === 'apple') {
            new_shape = 'mango';
            new_material = 'mango';
            new_radius = 2.25;
            score_add = 30;
        } else if (fruit1.shape === 'mango' && fruit2.shape === 'mango') {
            new_shape = 'orange';
            new_material = 'orange';
            new_radius = 2.5;
            score_add = 35;
        } else if (fruit1.shape === 'orange' && fruit2.shape === 'orange') {
            new_shape = 'melon';
            new_material = 'melon';
            new_radius = 2.75;
            score_add = 40;
        } else if (fruit1.shape === 'melon' && fruit2.shape === 'melon') {
            new_shape = 'coconut';
            new_material = 'coconut';
            new_radius = 3;
            score_add = 45;
        } else if (fruit1.shape === 'coconut' && fruit2.shape === 'coconut') {
            new_shape = 'watermelon';
            new_material = 'watermelon';
            new_radius = 3.25;
            score_add = 50;
        } else if (fruit1.shape === 'small_cube' && fruit2.shape === 'small_cube') {
            new_shape = 'large_cube';
            new_material = 'large_cube';
            new_radius = 1.5;
            score_add = 75;
        } else {
            return false; // Only merge fruits of the same shape
        }
        this.score += score_add;
        this.update_score();
        this.update_highscore();



        const new_velocity = fruit1.velocity.plus(fruit2.velocity).times(0.5);
        const new_position = fruit1.position.plus(fruit2.position).times(0.5);

        this.fruits.push({
            position: new_position,
            velocity: new_velocity,
            radius: new_radius,
            shape: new_shape,
            material: new_material,
            rotation: vec3(0, 0, 0)
        });

        // Remove the old fruits from the array
        this.fruits = this.fruits.filter(b => b !== fruit1 && b !== fruit2);
        return true;
    }

    handle_collisions() {
        for (let i = 0; i < this.fruits.length; i++) {
            for (let j = i + 1; j < this.fruits.length; j++) {
                let fruit1 = this.fruits[i];
                let fruit2 = this.fruits[j];
                if (this.check_collision(fruit1, fruit2)) {
                    if (!this.merge_fruits(fruit1, fruit2)) {
                        this.resolve_collision(fruit1, fruit2);
                    }
                }
            }
        }
    }

    // Update fruit positions
    update_positions(dt) {
        const damping_coefficient = 0.3; // Increased damping coefficient
        for (let fruit of this.fruits) {
            //fruit.velocity = fruit.velocity || vec3(0, 0, 0);
            fruit.velocity = fruit.velocity.plus(this.gravity.times(dt));

            // Apply friction if the fruit is on the ground
            if (fruit.position[1] <= this.floor_y + fruit.radius) {
                const friction_coefficient = 0.2; // Adjust this value as needed
                const friction = fruit.velocity.times(-friction_coefficient * dt);
                fruit.velocity = fruit.velocity.plus(friction);

                // If the velocity magnitude becomes very small, stop the fruit from moving
                if (fruit.velocity.norm() < 0.1) {
                    fruit.velocity.fill(0);
                }
            }

            fruit.position = fruit.position.plus(fruit.velocity.times(dt));

            //Update rotation based on horizontal velocity
            const rotation_axis = vec3(0, 0, 1);
            const rotation_angle = fruit.velocity[0] * dt / fruit.radius;
            fruit.rotation = fruit.rotation.plus(rotation_axis.times(rotation_angle));

            // Check for collision with the floor
            const restitution = 0.6; // Inelastic collision with the floor
            if (fruit.position[1] < this.floor_y + fruit.radius) {
                fruit.position[1] = this.floor_y + fruit.radius;
                fruit.velocity[1] = -fruit.velocity[1] * restitution; // Lose some energy on bounce
                fruit.velocity[1] -= damping_coefficient * fruit.velocity[1]; // Apply damping
            }

            // wall collision
            if (fruit.position[0] < -10 + fruit.radius) {
                fruit.position[0] = -10 + fruit.radius;
                fruit.velocity[0] = -fruit.velocity[0] * 0.4; // extra damping to remove vibration bug
                fruit.velocity[0] -= damping_coefficient * fruit.velocity[0];  
            }
            else if (fruit.position[0] > 10 - fruit.radius) {
                fruit.position[0] = 10 - fruit.radius; // other side 10-rad position
                fruit.velocity[0] = -fruit.velocity[0] * 0.4;
                fruit.velocity[0] -= damping_coefficient * fruit.velocity[0];
            }

        }
    }



    check_loss(t, context) {
        let temp = this.losing;
        for (let fruit of this.fruits) {
            if (fruit.position[1] > 12.5 && t > this.previoust + 1) {
                if (this.losing === temp) { // only update lost timer if it hasnt been updated in the last second
                    this.losing += 1;
                    this.previoust = t; // update time checker for precision
                }
            }
        }
        if (temp == this.losing && t > this.previoust + 2) this.losing = 0; // reset after 1 second of no fruit out of range
        //if (this.losing > 5) console.log("lost"); // 5 seconds, trigger loss condition 

        let timeuntilloss = 5 - this.losing;

        if (timeuntilloss <= 0) {
            this.canDrop = false;
            //this.GameLost = true; //-> can trigger other stuff
            this.shapes.text.set_string("Game Lost", context.context);
        }
        else {
            this.shapes.text.set_string("Lose in: " + timeuntilloss, context.context);
        }
    }

    // Draw the loss timer on the screen
    draw_losing_timer(context, program_state) {
        const t = this.losing.toFixed(2);
        const timer_text_transform = Mat4.translation(-8, 9, 0).times(Mat4.scale(0.5, 0.5, 0.5));
        this.shapes.text.set_string(`Timer: ${t}`, context.context);
        this.shapes.text.draw(context, program_state, timer_text_transform, this.materials.text_image);
    }



    draw_shadow(context, program_state, fruit) {
        // Check if the fruit is in mid-air
        if (fruit.position[1] > this.floor_y + fruit.radius + 0.01) {
            // Calculate the shadow position
            const shadow_position = vec3(fruit.position[0], this.floor_y + fruit.radius + 0.01, fruit.position[2]);

            // Define the shadow shape based on the fruit's shape
            let shadow_shape;
            if (fruit.shape === 'small_cube' || fruit.shape === 'large_cube') {
                // For cubes, draw a square shadow
                shadow_shape = this.shapes.floor;
            } else {
                // For other fruits, draw a spherical shadow
                shadow_shape = this.shapes.grape;
            }

            // Draw the shadow
            const shadow_radius = fruit.radius * (this.floor_y - shadow_position[1]) / (fruit.position[1] - this.floor_y);
            const shadow_transform = Mat4.translation(...shadow_position).times(Mat4.scale(shadow_radius, 0.1, shadow_radius));

            // Draw the shadow using the shadow material
            shadow_shape.draw(context, program_state, shadow_transform, this.materials.shadow);
        }
    }

    update_score() {
        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay) {
            scoreDisplay.textContent = `Score: ${this.score}`;
            scoreDisplay.innerHTML += `<br>High Score: ${this.highScore}`;
        }
    }

    update_highscore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
            this.update_score(); // Update score display to show new high score
        }
    }


    display(context, program_state) {
        super.display(context, program_state);

        const t = program_state.animation_time / 1000;
        const dt = program_state.animation_delta_time / 1000;

        //update drop timer 
        if (t > this.dropTimer + 1) {
            this.canDrop = true;
            this.dropTimer = t;
        }



        // Camera projections
        program_state.set_camera(Mat4.translation(0, -5, -35).times(Mat4.rotation(0.3, 1, 0, 0))); // TO CHANGE CAMERA BACK RESET TRANSLATION AND FOR ROTATION (0.3 -> -0.2)
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 0.1, 1000);

        // Add a light source to the scene
        const light_position = vec4(0, 10, 10, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        // Update fruit positions
        this.update_positions(dt);

        // Handle collisions
        this.handle_collisions();

        // Check if Lost 
        this.check_loss(t, context);

        // Draw the indicator line
        this.draw_indicator_line(context, program_state);

        // Draw fruits
        for (let fruit of this.fruits) {
            if (fruit.rotation.norm() > 0) { // Only use rotation matrix if rotation angle is non-zero/not changing
                const rotation_transform = Mat4.rotation(fruit.rotation.norm(), ...fruit.rotation.normalized());
                const transform = Mat4.translation(...fruit.position).times(rotation_transform).times(Mat4.scale(fruit.radius, fruit.radius, fruit.radius));
                this.shapes[fruit.shape].draw(context, program_state, transform, this.materials[fruit.material]);
            }
            else {
                this.shapes[fruit.shape].draw(context, program_state, Mat4.translation(...fruit.position).times(Mat4.scale(fruit.radius, fruit.radius, fruit.radius)), this.materials[fruit.material]);
            }
        }



        // Draw pre-drop fruit
        if (this.next_fruit) {
            this.shapes[this.next_fruit.shape].draw(context, program_state, Mat4.translation(...this.pre_drop_position).times(Mat4.scale(this.next_fruit.radius, this.next_fruit.radius, this.next_fruit.radius)), this.materials[this.next_fruit.material]);
        }
        // Draw fruits with shadow
        for (let fruit of this.fruits) {
            this.draw_shadow(context, program_state, fruit); // Draw shadow
            this.shapes[fruit.shape].draw(context, program_state, Mat4.translation(...fruit.position).times(Mat4.scale(fruit.radius, fruit.radius, fruit.radius)), this.materials[fruit.material]);
        }

        // Draw floor
        this.shapes.floor.draw(context, program_state, Mat4.translation(0, this.floor_y, 0).times(Mat4.scale(10, 0.1, 10)), this.materials.floor);

        //Draw timer
        //this.shapes.losstimer.draw(context, program_state, Mat4.translation(9, 15, 0).times(Mat4.scale(5, 1, 0.2)), this.materials.losstimer);
        this.shapes.text.draw(context, program_state, Mat4.translation(12, 16, 1).times(Mat4.scale(0.4, 0.5, 0.5)), this.materials.text_image);
        //this.shapes.text.set_string("Drop Timer", context.context);


        // Draw walls
        this.shapes.wall.draw(context, program_state, Mat4.translation(10, 5, 0).times(Mat4.scale(0.1, 7, 10)), this.materials.wall);
        this.shapes.wall.draw(context, program_state, Mat4.translation(-10, 5, 0).times(Mat4.scale(0.1, 7, 10)), this.materials.wall);
        this.shapes.wall.draw(context, program_state, Mat4.rotation(1.57, 0, 1, 0) // 1.57=pi/2
            .times(Mat4.translation(10, 5, 0))
            .times(Mat4.scale(0.1, 7, 10)), this.materials.wall);
    }
}
// Use the new Fruiter Scene as the main scene
const Main_Scene = Fruiter;
const Additional_Scenes = [];

export { Main_Scene, Additional_Scenes, Canvas_Widget, Code_Widget, Text_Widget, defs };