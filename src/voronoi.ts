// voronoi.ts
/**
 * Class for creating the voronoi diagram from the country datasets, which allows the distance calculations according to the Kelp Diagram paper
 * @module voronoi.ts
 */
import * as d3 from "d3";
import * as THREE from "three";

import { setVoronoiTexture } from "./index";
import { Library } from "@observablehq/notebook-stdlib";

import { I2DCountryData } from "./data";

export class Voronoi {
  private width = 1200;
  private height = 800;
  private radius = 18;

  private canvas;
  private svgs = [];

  private library = new Library();

  private countries = {};

  constructor(imageWidth, imageHeight) {
    this.width = imageWidth;
    this.height = imageHeight;
  }
/**
 * Creates the Voronoi diagram from the 2d datapoints 
 * @param datapoints2d 
 * @param color 
 */
  createVoronoi(datapoints2d: I2DCountryData[], color: string): void {
    const svg = d3
      .select("body")
      .append("svg")
      .attr("viewBox", [0, 0, this.width, this.height])
      .attr("stroke-width", 2);

    datapoints2d.forEach((dp) => {
      this.countries[dp.country_code] = this.countries[dp.country_code]
        ? this.countries[dp.country_code] + 1
        : 1;
    });

    const voronoi = d3.Delaunay.from(
      datapoints2d,
      (d) => d.x,
      (d) => d.y
    ).voronoi([0, 0, this.width, this.height]);

    const cell = svg
      .append("defs")
      .selectAll("clipPath")
      .data(datapoints2d)
      .join("clipPath")
      .attr("id", (d, i) => (d.id = this.library.DOM.uid("cell").id))
      .append("path")
      .attr("d", (d, i) => voronoi.renderCell(i));

    const circle = svg
      .append("g")
      .selectAll("g")
      .data(datapoints2d)
      .join("g")
      .attr("clip-path", (d) => "url(#" + d.id + ")")
      .append("g")
      .attr("transform", (d) => `translate(${d.x},${d.y})`)
      .call((g) =>
        g
          .append("circle")
          .attr(
            "r",
            (d) =>
              this.radius -
              (this.countries[d.country_code]
                ? this.countries[d.country_code] * 4
                : 0)
          )
          .attr("fill", color)
      );
      //.call((g) => g.append("circle").attr("r", 2.5));

    this.svgs.push(svg);
  }
/**
 * Applies the voronoi diagram in to the canvas
 */
  voronoiToCanvas() {
    this.canvas = d3
      .select("body")
      .append("canvas")
      .attr("width", this.width)
      .attr("height", this.height);
    const context = this.canvas.node().getContext("2d");
    setVoronoiTexture(this.canvas.node());
    this.svgs.forEach((svg, i) => {
      const svgNode = svg.node();
      const svgData = new XMLSerializer().serializeToString(svgNode);
      const voronoiImage = document.createElement("img");
      voronoiImage.setAttribute(
        "src",
        "data:image/svg+xml;base64," +
          window.btoa(unescape(encodeURIComponent(svgData)))
      );
      const that = this;
      voronoiImage.onload = function () {
        context.drawImage(voronoiImage, 0, 0, that.width, that.height);
        setVoronoiTexture(that.canvas.node());
        if (i == that.svgs.length - 1) {
          that.teardown();
        }
      };
    });
    if (this.svgs.length == 0) {
      this.teardown();
    }
  }

  /**
   * destroys the canvas
   */
  teardown() {
    this.canvas.remove();
    this.svgs.forEach((svg) => {
      svg.remove();
      this.svgs = [];
      this.countries = {};
    });
  }
}
