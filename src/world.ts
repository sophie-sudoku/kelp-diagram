// world.ts
/**
 * World texture class, adds the world image and the borders in to the canvas. Uses topojson for creating the borders 
 * @module world.ts
 * 
 */
import * as d3 from 'd3';
import * as topojson from 'topojson';
import { setCountryBordersTexture } from './index';

export class WorldTexture {

    constructor() {
    }

    createAlbedoImage() {
        const worldMapImage = document.createElement("img");
        worldMapImage.src = 'assets/world2.jpg';
        const canvas = d3
            .select("body")
            .append("canvas")
            .attr("width", 1200)
            .attr("height", 800);
        const context = canvas.node().getContext("2d");
        const that = this;
        worldMapImage.onload = function() {
            context.drawImage(worldMapImage, 0, 0, 2400, 1600);
            //setWorldAlbedoTexture(canvas.node());
            canvas.remove();
        }
    }


    createCountryBordersImage() {
        const canvas = d3
            .select("body")
            .append("canvas")
            .attr("width", 8192)
            .attr("height", 4096);
        const context = canvas.node().getContext("2d");
        context.rect(0, 0, 8192, 4096);
        context.fillStyle = 'rgb(173,216,230)';
        context.fill();
        const projection = d3
            .geoEquirectangular()
            .translate([4096, 2048])
            .scale(1304);
        d3.json("assets/world.json")
            .then(function(data) {
                const countries = topojson.feature(data, data.objects.countries);
                context.strokeStyle = "black";
                context.lineWidth = 0.8;
                context.fillStyle = "gray";
                context.beginPath();
                const path = d3
                    .geoPath()
                    .projection(projection)
                    .context(context);
                path(countries);
                context.fill();
                context.stroke();
                setCountryBordersTexture(canvas.node());
                canvas.remove();
            }
        ).catch(function(error) {
                // Do some error handling.
                console.log('ERROR')
            }
        );
    }
}
