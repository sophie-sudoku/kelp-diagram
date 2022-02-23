// index.ts
/**
 * This is the doc comment for index.ts
 *
 * index.ts serves as an entry point for the TypeScript code.
 * The canvas and everything that is drawn on it are being initialized here. 
 * Also, the voronoi mesh for the Three.js scene is created alongside projecting a 2d image of the map of the world and their borders into a 3d sphere.
 * 
 * @module index.ts
 */

import './style.css';

import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

import { Voronoi } from './voronoi';
import { WorldTexture } from './world';
import { Linking } from './linking';
import { Data, I2DCountryData, I3DCountryData, ICountryData } from './data';
import * as rawdata from '../data.json';
import { Dijkstra } from './dijkstra';

/**
* This comment _supports_ [Markdown](https://marked.js.org/)
*/
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xF );
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls( camera, renderer.domElement);
controls.update();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const lightAmbient = new THREE.AmbientLight( 0x404040 ); 
lightAmbient.intensity = 4;
scene.add(lightAmbient);

// Create sphere for voronoi projection
const voronoiMaterial = new THREE.MeshPhongMaterial({
  map: new THREE.Texture(),
  transparent : true,
  opacity: 1,
  blending: THREE.AdditiveAlphaBlending,
  side: THREE.DoubleSide
});
voronoiMaterial.map.minFilter = THREE.LinearFilter;

const voronoiSphere = new THREE.Mesh(
  new THREE.SphereGeometry(4.51, 100, 100),
  voronoiMaterial
);

scene.add(voronoiSphere);

// Create sphere with country borders
const worldBordersMaterial = new THREE.MeshPhongMaterial({
  map: new THREE.Texture()
});
worldBordersMaterial.map.minFilter = THREE.LinearFilter;

const worldBordersSphere = new THREE.Mesh(
  new THREE.SphereGeometry(4.5, 100, 100),
  worldBordersMaterial
);

scene.add(worldBordersSphere);

camera.position.x = 5;
camera.position.y = 5;
camera.position.z = 5;

camera.lookAt(scene.position);

function setVoronoiTexture(image): void {
  const texture = new THREE.Texture(image);
  texture.needsUpdate = true;
  voronoiMaterial.map = texture;
}

function setCountryBordersTexture(image): void {
  const texture = new THREE.Texture(image);
  texture.needsUpdate = true;
  worldBordersMaterial.map = texture;
}

export { setVoronoiTexture, setCountryBordersTexture };

const worldTexture = new WorldTexture();
//worldTexture.createAlbedoImage();
worldTexture.createCountryBordersImage();

const imageWidth = 4800;
const imageHeight = 3200;
const voronoi = new Voronoi(imageWidth, imageHeight);
const linking = new Linking(scene, 4.5);

// Collect the data
const data = new Data(rawdata, 4.5, imageWidth, imageHeight)

// wireframe is not adding value to the application
/*
const wireframeToggle = document.getElementById('wireframe');
wireframeToggle.addEventListener('click', function(value) {
  if ((<any>wireframeToggle).checked) {
    worldBordersMaterial.wireframe = true;
  } else {
    worldBordersMaterial.wireframe = false;
  }
});
*/

var checkboxes = document.querySelectorAll("input[type=checkbox]");
let enabledSettings = []

let dijkstra = new Dijkstra()

checkboxes.forEach(function(checkbox) {
  checkbox.addEventListener('change', function() {
    if (Array.from(document.getElementsByTagName('input')).map((input) => +input.checked).reduce((accumulator, currentValue) => accumulator + currentValue) > 3) {
      (<HTMLInputElement>checkbox).checked = false;
      return;
    }
    enabledSettings = 
      Array.from(checkboxes)
      .filter(i => (<any>i).checked)
      .map(i => (<any>i).value)
    linking.clear();
    enabledSettings.forEach(enabledSet => {
      switch(enabledSet) {
        case 'EU': {
          voronoi.createVoronoi(data.datapoints_2d.eu_2d, "rgb(255,0,100)");
          linking.createLinksForSet(dijkstra.mapToDijkstra(data.datapoints_3d.eu_3d), new THREE.Color("rgb(255,0,100)" ), 1);
          break;
        }
        case 'NATO': {
          voronoi.createVoronoi(data.datapoints_2d.nato_2d, "rgb(188,156,244)");
          linking.createLinksForSet(dijkstra.mapToDijkstra(data.datapoints_3d.nato_3d), new THREE.Color( "rgb(188,156,244)" ), 1);
          break;
        }
        case 'OECD': {
          voronoi.createVoronoi(data.datapoints_2d.oecd_2d, "rgb(150,254,28)");
          linking.createLinksForSet(dijkstra.mapToDijkstra(data.datapoints_3d.oecd_3d), new THREE.Color( "rgb(150,254,28)" ), 1);
          break;
        }
        case 'G7': {
          voronoi.createVoronoi(data.datapoints_2d.g7_2d, "rgb(255, 172, 87)");
          linking.createLinksForSet(dijkstra.mapToDijkstra(data.datapoints_3d.g7_3d), new THREE.Color( "rgb(255, 172, 87)"), 1);
          break;
        }
        case 'UN': {
          voronoi.createVoronoi(data.datapoints_2d.un_2d, "rgb(58, 182, 202)");
          linking.createLinksForSet(dijkstra.mapToDijkstra(data.datapoints_3d.un_3d), new THREE.Color( "rgb(58, 182, 202)" ), 1);
          break;
        }
        case 'OSCE': {
          voronoi.createVoronoi(data.datapoints_2d.osce_2d, "rgb(10,10,10)");
          linking.createLinksForSet(dijkstra.mapToDijkstra(data.datapoints_3d.osce_3d), new THREE.Color( "rgb(10,10,10)"), 1);
          break;
        }
        case 'COE': {
          voronoi.createVoronoi(data.datapoints_2d.coe_2d, "rgb(13,99,193)");
          linking.createLinksForSet(dijkstra.mapToDijkstra(data.datapoints_3d.coe_3d), new THREE.Color( "rgb(13,99,193)"), 1);
          break;
        }
        case 'ILO': {
          voronoi.createVoronoi(data.datapoints_2d.ilo_2d, "rgb(2, 114, 15)");
          linking.createLinksForSet(dijkstra.mapToDijkstra(data.datapoints_3d.ilo_3d), new THREE.Color( "rgb(2, 114, 15)"), 1);
          break;
        }
        case 'INTERPOL': {
          voronoi.createVoronoi(data.datapoints_2d.interpol_2d, "rgb(164, 54, 35)");
          linking.createLinksForSet(dijkstra.mapToDijkstra(data.datapoints_3d.interpol_3d), new THREE.Color( "rgb(164, 54, 35)" ), 1);
          break;
        }
        case 'uncfcc': {
          voronoi.createVoronoi(data.datapoints_2d.uncfcc_2d, "rgb(10, 58, 18)");
          linking.createLinksForSet(dijkstra.mapToDijkstra(data.datapoints_3d.uncfcc_3d), new THREE.Color( "rgb(10, 58, 18)" ), 1.1);
          break;
        }
      }
    });
    voronoi.voronoiToCanvas();
  })
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let x = 0;
let y = 0;

function onMouseMove( event ) {
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  x = event.clientX;
  y = event.clientY;
}

function animate(): void {
  requestAnimationFrame(animate);
  render();
  controls.update();
}

const tooltip = document.createElement('div');
var tooltipText = document.createTextNode("Hi there and greetingssss!");
tooltip.appendChild(tooltipText);
document.body.insertBefore(tooltip, document.body.firstElementChild);
tooltip.style.color = 'white';
tooltip.style.position = 'absolute';
tooltip.style.top = '0px';
tooltip.style.left = '0px';
tooltip.style.height = 'fit-content';
tooltipText.textContent = 'changes';
tooltip.style.visibility = 'hidden';
tooltip.style.display = 'flex';
tooltip.style.flexDirection = 'column';

const boxes = document.createElement('div');
boxes.style.flexDirection = 'row';
boxes.style.display = 'flex';
boxes.style.width = '-webkit-fill-available';
boxes.style.paddingTop = '60px';
boxes.style.justifyContent = 'space-around';

const euBox = document.createElement('div');
euBox.className = 'box eu';
euBox.style.position = 'relative';

const natoBox = document.createElement('div');
natoBox.className = 'box nato';
natoBox.style.position = 'relative';

const oecdBox = document.createElement('div');
oecdBox.className = 'box oecd';
oecdBox.style.position = 'relative';

const g7Box = document.createElement('div');
g7Box.className = 'box g7';
g7Box.style.position = 'relative';

const unBox = document.createElement('div');
unBox.className = 'box un';
unBox.style.position = 'relative';

const osceBox = document.createElement('div');
osceBox.className = 'box osce';
osceBox.style.position = 'relative';

const iloBox = document.createElement('div');
iloBox.className = 'box ilo';
iloBox.style.position = 'relative';

const coeBox = document.createElement('div');
coeBox.className = 'box coe';
coeBox.style.position = 'relative';

const interpolBox = document.createElement('div');
interpolBox.className = 'box interpol';
interpolBox.style.position = 'relative';

const uncfccBox = document.createElement('div');
uncfccBox.className = 'box uncfcc';
uncfccBox.style.position = 'relative';

tooltip.appendChild(boxes);

function render(): void {
  raycaster.setFromCamera( mouse, camera );
  const intersects = raycaster.intersectObjects( scene.children[4].children );
  if (intersects.length > 0 && (tooltipText.textContent != intersects[0].object.userData.country || tooltip.style.visibility == 'hidden')) {
    tooltipText.textContent = intersects[0].object.userData.country;
    tooltip.style.visibility = 'visible';
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    const dp = data.data.filter((dp) => dp.country == intersects[0].object.userData.country)[0]
    while (boxes.firstChild) {
      boxes.removeChild(boxes.firstChild);
    }
    if (dp.in_eu) {
      console.log('eu');
      boxes.appendChild(euBox);
    }
    if (dp.in_uncfcc) {
      boxes.appendChild(uncfccBox);
    }
    if (dp.in_nato) {
      boxes.appendChild(natoBox);
    }
    if (dp.in_oecd) {
      boxes.appendChild(oecdBox);
    }
    if (dp.in_g7) {
      boxes.appendChild(g7Box);
    }
    if (dp.in_un) {
      boxes.appendChild(unBox);
    }
    if (dp.in_osce) {
      boxes.appendChild(osceBox);
    }
    if (dp.in_coe) {
      boxes.appendChild(coeBox);
    }
    if (dp.in_ilo) {
      boxes.appendChild(iloBox);
    }
    if (dp.in_interpol) {
      boxes.appendChild(interpolBox);
    }
  } else if (intersects.length == 0) {
    tooltip.style.visibility = 'hidden';
  }
  renderer.render(scene, camera);
}

window.addEventListener( 'mousemove', onMouseMove, false );

let infoboxes = document.querySelectorAll("div[class=info-box]");

infoboxes.forEach((btn: HTMLElement) => {
  btn.addEventListener('click', (e: any) => {
    let value = (document.getElementById(btn.id))
    showInfo(e.srcElement.id)
  })
})

let closeInfoContainer = document.getElementsByClassName('hide-btn')[0]
closeInfoContainer.addEventListener('click', (e: any) => {
  closeInfo()
});

let headerElement = document.getElementsByClassName('organization-name')[0]
let countryListElement = document.getElementsByClassName('country-list')[0]
let orgInfoElement = document.getElementsByClassName('org-info-text')[0]
const showInfo = (org: string) => {
  let container = document.getElementsByClassName('info-container')[0]
  container.className = 'show info-container'
  console.log(org)
  let orgName = org.split('-')[0]
  let countries = data.countries[orgName]
  let countryNames = countries.map((element: ICountryData) => {
  console.log(element)
    return "<li>" + element.country + "</li>"
  }).toString();
  countryNames = countryNames.replace(/,/g, '')
  let organizationInfo = data.countries.org_infos[orgName]
  headerElement.innerHTML = orgName
  countryListElement.innerHTML = countryNames
  orgInfoElement.innerHTML = organizationInfo
}

const closeInfo = () => {
  let container = document.getElementsByClassName('info-container')[0]
  container.className = 'hide info-container'
}
animate();