// linking.ts
/**
 * Class for the links between dots (countries)
 * @module linking.ts
 */
import * as THREE from 'three';
import * as d3 from 'd3';
import { I3DCountryDijkstraData } from './dijkstra';

/**
 *  creates links for countries belonging in a set of organizations
 */
interface Link {
    country1: string;
    country2: string;
    color: THREE.Color;
    link: THREE.Mesh;
}

export class Linking {

    scene: THREE.Scene;
    radius: number;
    links: THREE.Group;
    intersectionInfoBoxes: THREE.Group;
    linkedLinks: Link[] = [];

    constructor(scene: THREE.Scene, radius: number) {
        this.scene = scene;
        this.radius = radius;
        this.links = new THREE.Group();
        this.scene.add(this.links);
        this.intersectionInfoBoxes = new THREE.Group();
        this.scene.add(this.intersectionInfoBoxes);
    }

    clear() {
        this.linkedLinks = [];
        this.links.remove(...this.links.children);
    }

    /**
     * Create links between datapoints belonging in a set
     * @param datapoints3d 
     * @param color 
     * @param altitude 
     */
    createLinksForSet(datapoints3d: I3DCountryDijkstraData[], color: THREE.Color, altitude: number): void {
        for (let i = 0; i < datapoints3d.length; i++) {
            const indexConnectedPoint = datapoints3d[i].descendent;
            this.createTube(datapoints3d[i], datapoints3d[indexConnectedPoint], color, altitude);
        }
    }

    /**
     * Creates the Three.js vectors, i.e tubes, that curve between the datapoints belonging into a same set
     * @param startpoint 
     * @param endpoint 
     * @param color 
     * @param altitude 
     */
    createTube(startpoint: I3DCountryDijkstraData, endpoint: I3DCountryDijkstraData, color: THREE.Color, altitude: number): void {
            altitude = altitude * this.getDistance(startpoint, endpoint) / 4;
            const start = new THREE.Vector3(startpoint.x, startpoint.y, startpoint.z);
            const end = new THREE.Vector3(endpoint.x, endpoint.y, endpoint.z);
            const materialHover = new THREE.MeshBasicMaterial({
                color,
                opacity: 0,
                transparent: true
            });
            const sphereHover = new THREE.SphereGeometry( 0.1, 32, 32 );
            const startHover = new THREE.Mesh(sphereHover, materialHover);
            startHover.position.set(startpoint.x, startpoint.y, startpoint.z);
            startHover.userData = {};
            startHover.userData.country = startpoint.country;
            var geoInterpolator = d3.geoInterpolate(
                [startpoint.longitude, startpoint.latitude],
                [endpoint.longitude, endpoint.latitude]);
    
            const midCoord1 = geoInterpolator(0.25);
            const midCoord2 = geoInterpolator(0.75);
    
            let mid1 = this.coordinateToPosition(
                midCoord1[1],
                midCoord1[0],
                this.radius + altitude
            );
            let mid2 = this.coordinateToPosition(
                midCoord2[1],
                midCoord2[0],
                this.radius + altitude
            );
            let colors = [];
            colors.push(color);
            this.linkedLinks.forEach((link_) => {
                if ((link_.country1 == startpoint.country && link_.country2 == endpoint.country) ||
                    (link_.country2 == startpoint.country && link_.country1 == endpoint.country)) {
                    this.links.remove(link_.link);
                    colors.push(link_.color);
                }
            });
            var m = new THREE.MeshBasicMaterial({
                map: new THREE.Texture()
            });

            if (colors.length > 1) {
                console.log('colors.length', colors.length);
                const canvas = d3
                .select("body")
                .append("canvas")
                .attr("width", 800)
                .attr("height", 20);
                var drawingContext = canvas.node().getContext("2d");
                const numberStripes = 12;
                for (var i=0;i < numberStripes;i++){
                    const thickness = 800 / numberStripes;
                    drawingContext.beginPath();
                    const color_ = colors[i % colors.length];
                    drawingContext.strokeStyle = `rgb(${color_.r * 255}, ${color_.g * 255}, ${color_.b * 255})`;
                    drawingContext.lineWidth = thickness;
                    drawingContext.moveTo(i*thickness + thickness/2,0);
                    drawingContext.lineTo(i*thickness+thickness/2,20);
                    drawingContext.stroke();
                }
                const image = document.createElement("img");
                image.src = canvas.node().toDataURL();
                const that = this;
                image.onload = function () {
                    drawingContext.drawImage(image, 0, 0, 800, 20);
                    const texture = new THREE.Texture(canvas.node());
                    texture.needsUpdate = true;
                    m.map = texture;
                    image.remove();
                    canvas.remove();
                };
            } else {
                m.map = null;
                m.color = color;
            }
            const curve = new THREE.CubicBezierCurve3(start, mid1, mid2, end);
            const g = new THREE.TubeGeometry(curve, 100, 0.01, 10, false);
            const mesh = new THREE.Mesh(g, m);
            this.links.add(mesh);
            this.linkedLinks.push({country1: startpoint.country, country2: endpoint.country, color: color, link: mesh});
            this.intersectionInfoBoxes.add(startHover);
        }

/**
 * Corrects the coordinate into correct positions in the Three.js scene
 * @param lat 
 * @param lng 
 * @param radius 
 * @returns 
 */
    coordinateToPosition(lat, lng, radius) {
        const phi = (90 - lat) * Math.PI / 180;
        const theta = (lng + 180) * Math.PI / 180;
      
        return new THREE.Vector3(
            -radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
        );
    }
/**
 * Returns the distance between two datapoints
 * @param datapoints1 
 * @param datapoints2 
 * @returns 
 */
    getDistance(datapoints1: I3DCountryDijkstraData, datapoints2: I3DCountryDijkstraData) : number {
        return Math.sqrt(Math.pow((datapoints1.x - datapoints2.x), 2) + Math.pow((datapoints1.y - datapoints2.y), 2) + Math.pow((datapoints1.z - datapoints2.z), 2))
    }
}