// dijkstra.ts
/**
 * Class for the Dijkstra algorithm
 * @module dijkstra.ts
 * 
 * 
 */
import { I3DCountryData } from './data';
export interface I3DCountryDijkstraData extends I3DCountryData {
    distance: number
    descendent: number
}
/**
 * Dijkstra class.
 */
export class Dijkstra {

    visited: number[];
    datapoints3DDijkstra: I3DCountryDijkstraData[];

    constructor() {}

    /**
     * initalizes all datapoints in the network with starting point having distance to itself as 0 and shortest distance to all other datapoints is inifinity
     * @param datapoints3d 3d datapoints, projected from the coordinates into 3d in the Data class
     * @returns adjacency matrix
     */
    initializePoints(datapoints3d: I3DCountryData[]): I3DCountryDijkstraData[] {
        this.visited = [];
        let datapoints3DDijkstra: I3DCountryDijkstraData[] = [];
        datapoints3d.forEach((datapoint) => {
            let datapoint3DDijkstra_: I3DCountryDijkstraData = Object.assign(
                {},
                datapoint,
                {distance: Infinity, descendent: -1}
            );
            datapoints3DDijkstra.push(datapoint3DDijkstra_);
        });
        datapoints3DDijkstra[0].distance = 0;
        datapoints3DDijkstra[0].descendent = 0;
        return datapoints3DDijkstra;
    }

    /**
     * get distance between 2 datapoints
     * @param datapoints1 
     * @param datapoints2 
     * @returns 
     */
    getDistance(datapoints1: I3DCountryData, datapoints2: I3DCountryData) : number {
        return Math.sqrt(Math.pow((datapoints1.x - datapoints2.x), 2) + Math.pow((datapoints1.y - datapoints2.y), 2) + Math.pow((datapoints1.z - datapoints2.z), 2))
    }

    /**
     * map datapoints into a network so that dijkstra can be used.
     * dijkstra algorithm is also called in this method with 0 as the starting point
     * @param datapoints3d 
     * @returns 
     */
    mapToDijkstra(datapoints3d: I3DCountryData[]): I3DCountryDijkstraData[] {
        this.datapoints3DDijkstra = this.initializePoints(datapoints3d);
        this.dijkstra(0);
        return this.datapoints3DDijkstra;
    }

    /**
     * Implementation of dijkstra's shortest path algorithm. See https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm for more information
     *
     * @param idxStart starting index
     */
    dijkstra(idxStart: number)
    {
        if (this.visited.length <= this.datapoints3DDijkstra.length) {
            let minDistance = Infinity
            let index = 0
            let distance = Infinity
            this.visited.push(idxStart)
            this.datapoints3DDijkstra.forEach((datapointEnd, idxEnd) => {
                if (!(this.visited.includes(idxEnd))) {
                    distance = this.getDistance(this.datapoints3DDijkstra[idxStart], datapointEnd)
                    // store the distance if it is smaller as the current one
                    if (distance < this.datapoints3DDijkstra[idxEnd].distance) {
                        this.datapoints3DDijkstra[idxEnd].distance = distance;
                        this.datapoints3DDijkstra[idxEnd].descendent = idxStart;
                    }
                    // save the minimal distance to get the next starting point for daikstra
                    if (distance < minDistance) {
                        minDistance = distance;
                        index = idxEnd;
                    }
                }
            })
            this.dijkstra(index);
        }
    }

}