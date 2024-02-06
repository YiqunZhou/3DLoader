//This code is modified from https://github.com/dgreenheck/threejs-gltf-import and https://github.com/mrdoob/three.js/blob/master/examples/webgl_clipping.html
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
			import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
			import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

			

      let camera, scene, renderer, startTime , mesh,stats;

			init();
			animate();

			function init() {

				camera = new THREE.PerspectiveCamera( 36, window.innerWidth / window.innerHeight, 0.25, 50 );

				camera.position.set( 0, 9, 3 );

				scene = new THREE.Scene();

				// Lights

				scene.add( new THREE.AmbientLight( 0xcccccc ) );

				const spotLight = new THREE.SpotLight( 0xffffff,  3, 100, 0.22, 1);
				spotLight.angle = Math.PI / 5;
				spotLight.penumbra = 0.2;
				spotLight.position.set( 2, 25, 3 );
				spotLight.castShadow = true;
				spotLight.shadow.camera.near = 3;
				spotLight.shadow.camera.far = 10;
				spotLight.shadow.mapSize.width = 1024;
				spotLight.shadow.mapSize.height = 1024;
				scene.add( spotLight );

				const dirLight = new THREE.DirectionalLight( 0x55505a, 3 );
				dirLight.position.set( 0, 10, 0 );
				dirLight.castShadow = true;
				dirLight.shadow.camera.near = 1;
				dirLight.shadow.camera.far = 10;

				dirLight.shadow.camera.right = 1;
				dirLight.shadow.camera.left = - 1;
				dirLight.shadow.camera.top	= 1;
				dirLight.shadow.camera.bottom = - 1;

				dirLight.shadow.mapSize.width = 1024;
				dirLight.shadow.mapSize.height = 1024;
				scene.add( dirLight );

				// ***** Clipping planes: *****

				const localPlane = new THREE.Plane( new THREE.Vector3( 0, -1, 0 ), 0.8 );
				const globalPlane = new THREE.Plane( new THREE.Vector3( - 3, 0, 0 ), 4 );

				// Geometry

				const material = new THREE.MeshPhongMaterial( {
					color: 0x80ee10,
					shininess: 100,
					side: THREE.DoubleSide,

					// ***** Clipping setup (material): *****
					clippingPlanes: [ localPlane ],
					clipShadows: true,

					alphaToCoverage: true,

				} );

				const markerGeometry = new THREE.SphereGeometry(0.1);
const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const planeMarker = new THREE.Mesh(markerGeometry, markerMaterial);

// Set the position of the marker to match the position of the local plane. This Debugger is generated by GPT3.5 on Feb 3rd 2023
planeMarker.position.copy(localPlane.normal).multiplyScalar(localPlane.constant);

// Add the marker to the scene
scene.add(planeMarker);

        const groundGeometry = new THREE.PlaneGeometry(20, 20, 32, 32);
        groundGeometry.rotateX(-Math.PI / 2);
        const groundMaterial = new THREE.MeshStandardMaterial({
          color: 0x555555,
          side: THREE.DoubleSide
        });
        const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
        groundMesh.castShadow = false;
        groundMesh.receiveShadow = true;
        scene.add(groundMesh);
        
   //load human glb     
   let originalMaterials = new Map(); 
        const loader = new GLTFLoader().setPath('public/shelly/');
        loader.load('humanColor.glb', (glb) => {
           mesh = glb.scene;
        
          mesh.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
			  child.material = material;
            // child.material.map = child.material.map;
			
				// originalMaterials.set(child, child.material.clone()); // Store original material
				// // Apply the clipping plane's material
				// child.material = material;
			
            }
          });
//load human glb


		  
        
          mesh.position.set(0, 4, 0);
          mesh.scale.set(2, 2, 2);
		//   mesh.material = material;
		  mesh.castShadow = true;
          scene.add(mesh);
        
		  performIntersectionCheck(mesh);
		}, (xhr) => {
			document.getElementById('progress').innerHTML = `LOADING ${Math.max(xhr.loaded / xhr.total, 1) * 100}/100`;
		});
		
		// // Define a function to perform the intersection check
		// function performIntersectionCheck(mesh) {
		// 	const raycaster = new THREE.Raycaster();
		// 	raycaster.set(mesh.position, localPlane.normal);
		
		// 	const intersectionResults = raycaster.intersectObject(mesh);
		
		// 	if (intersectionResults.length > 0) {
		// 		console.log('Mesh intersects with the clipping plane.');
		// 		const intersectionPoint = intersectionResults[0].point;
		// 		console.log('Intersection point:', intersectionPoint);
		// 	} else {
		// 		console.log('Mesh does not intersect with the clipping plane.');
		// 	}
		// }



        const loaderRoom = new GLTFLoader().setPath('public/shelly/');
        loaderRoom.load('roomColor.glb', (glb) => {
          const meshRoom = glb.scene;
        
          meshRoom.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
        
          meshRoom.position.set(0, 2.5, 0);
          meshRoom.scale.set(2, 2, 2);
          scene.add(meshRoom);
        
          document.getElementById('progress-container').style.display = 'none';
        }, ( xhr ) => {
          document.getElementById('progress').innerHTML = `LOADING ${Math.max(xhr.loaded / xhr.total, 1) * 100}/100`;
        },);
  

   
				// Stats

				stats = new Stats();
				document.body.appendChild( stats.dom );

				// Renderer

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.shadowMap.enabled = true;
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				window.addEventListener( 'resize', onWindowResize );
				document.body.appendChild( renderer.domElement );

				// ***** Clipping setup (renderer): *****
				const globalPlanes = [ globalPlane ],
					Empty = Object.freeze( [] );
				renderer.clippingPlanes = Empty; // GUI sets it to globalPlanes
				renderer.localClippingEnabled = true;

				// Controls
				const controls = new OrbitControls(camera, renderer.domElement);
				controls.enableDamping = true;
				controls.enablePan = false;
				controls.minDistance = 5;
				controls.maxDistance = 20;
				controls.minPolarAngle = 0.5;
				controls.maxPolarAngle = 1.5;
				controls.autoRotate = false;
				controls.target = new THREE.Vector3(0, 1, 0);
				controls.update();

				// const controls = new OrbitControls( camera, renderer.domElement );
				// controls.target.set( 0, 1, 0 );
				// controls.update();

				// GUI

				const gui = new GUI(),
					props = {
						alphaToCoverage: true,
					},
					folderLocal = gui.addFolder( 'Local Clipping' ),
					propsLocal = {

						get 'Enabled'() {

							return renderer.localClippingEnabled;

						},
						set 'Enabled'( v ) {

							renderer.localClippingEnabled = v;

						},

						get 'Shadows'() {

							return material.clipShadows;

						},
						set 'Shadows'( v ) {

							material.clipShadows = v;

						},

						get 'Plane'() {

							return localPlane.constant;

						},
						set 'Plane'( v ) {

							localPlane.constant = v;

						}

					},
					folderGlobal = gui.addFolder( 'Global Clipping' ),
					propsGlobal = {

						get 'Enabled'() {

							return renderer.clippingPlanes !== Empty;

						},
						set 'Enabled'( v ) {

							renderer.clippingPlanes = v ? globalPlanes : Empty;

						},

						get 'Plane'() {

							return globalPlane.constant;

						},
						set 'Plane'( v ) {

							globalPlane.constant = v;

						}

					};

				gui.add( props, 'alphaToCoverage' ).onChange( function ( value ) {

					ground.material.alphaToCoverage = value;
					ground.material.needsUpdate = true;

					material.alphaToCoverage = value;
					material.needsUpdate = true;

				} );
				folderLocal.add( propsLocal, 'Enabled' );
				folderLocal.add( propsLocal, 'Shadows' );
				folderLocal.add( propsLocal, 'Plane', 0.3,10 );
				

				folderGlobal.add( propsGlobal, 'Enabled' );
				folderGlobal.add( propsGlobal, 'Plane', - 3, 3 );

				// Start

				startTime = Date.now();

			}

     

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function animate() {

        requestAnimationFrame( animate );

        if(mesh){

				const currentTime = Date.now();
				const time = ( currentTime - startTime ) / 1000;

				

				mesh.position.y = 2;
				// mesh.rotation.x = time * 0.5;
				mesh.rotation.y = time * 0.2;
				// mesh.scale.setScalar( Math.cos( time ) * 0.125 + 0.875 );
      }

				stats.begin();
				renderer.render( scene, camera );
				stats.end();

			}




