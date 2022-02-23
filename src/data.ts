// data.ts
/**
 * Data class.
 *
 * data.ts contains the interfaces for the data that has been scraped previously and is stored in data.json
 * Also, preprocessing for the data is done here to transform it into a correct json format which can then be used by the application 
 * @module data.ts
 */
import * as organization_infos from '../assets/organization_info.json'

/**
 * ICountryData is an interface for the data for one country
 */
export interface ICountryData {
  country_code: string;
  country: string;
  latitude: number;
  longitude: number;
  in_eu: boolean;
  in_uncfcc: boolean;
  in_nato: boolean;
  in_oecd: boolean;
  in_g7: boolean;
  in_un: boolean;
  in_osce: boolean;
  in_coe: boolean;
  in_ilo: boolean;
  in_interpol: boolean;
}
/**
 * I3DCountryData is an extension to ICountryData interface, adding x, y and z coordinates
 * allowing the connections between countries to the correct location in the 3d sphere
 * 
 */
export interface I3DCountryData extends ICountryData {
  x: number;
  y: number;
  z: number;
}
/**
 * I2DCountryData is an extension to ICountryData interface, adding x and y coordinates
 * allowing the projection of the data to the correct location on the map
 */
export interface I2DCountryData extends ICountryData {
  x: number;
  y: number;
}
/**
 * ICountries interface has all the organizations with list of countries belonging to them. 
 */

export interface IOrganizationInfo {
  eu: string;
  nato: string;
  oecd: string;
  g7: string;
  uncfcc: string;
  un: string;
  coe: string;
  interpol: string;
  ilo: string;
}
export interface ICountries {
  uncfcc: ICountryData[];
  eu: ICountryData[];
  nato: ICountryData[];
  oecd: ICountryData[];
  g7: ICountryData[];
  un: ICountryData[];
  osce: ICountryData[];
  coe: ICountryData[];
  ilo: ICountryData[];
  interpol: ICountryData[];
  org_infos?: IOrganizationInfo;
}

/**
 * contains the 2d datapoints for the countries separated in each organization
 */
export interface I2DDataPoints {
  uncfcc_2d: I2DCountryData[];
  eu_2d: I2DCountryData[];
  nato_2d: I2DCountryData[];
  oecd_2d: I2DCountryData[];
  g7_2d: I2DCountryData[];
  un_2d: I2DCountryData[];
  osce_2d: I2DCountryData[];
  coe_2d: I2DCountryData[];
  ilo_2d: I2DCountryData[];
  interpol_2d: I2DCountryData[];
}

/**
 * contains the 3d datapoints for the countries separated in each organization
 */
export interface I3DDataPoints {
  uncfcc_3d: I3DCountryData[];
  eu_3d: I3DCountryData[];
  nato_3d: I3DCountryData[];
  oecd_3d: I3DCountryData[];
  g7_3d: I3DCountryData[];
  un_3d: I3DCountryData[];
  osce_3d: I3DCountryData[];
  coe_3d: I3DCountryData[];
  ilo_3d: I3DCountryData[];
  interpol_3d: I3DCountryData[];
}

/*
# UNFCC
# EU
# NATO
# OECD
# G7
# UN
# OSCE
# COE
# ILO
# INTERPOL
*/

/**
 * Data class is initialized, for example, like this:
 * ```
 * const data = new Data(rawdata, 4.5, imageWidth, imageHeight)
 * ```
 * where: 
 *  - `rawdata` is the raw data extracted from data.json
 *  - `4.5` is the radius, which the data points will have in the 
 *  - `imageWidth` and `imageHeight`is a constant which is required for mapping the data coordinates in to the 2d map
 * 
 * When this class is initialized, the preprocessing of the data is done in a loop which adds each country to all the correct organizations and maps coordinates into 2d and 3d.
 */
export class Data {
  // define variables
  data: ICountryData[];
  countries: ICountries;
  datapoints_2d: I2DDataPoints;
  datapoints_3d: I3DDataPoints;
  organization_infos: IOrganizationInfo

  constructor(
    data: ICountryData[],
    radius: number,
    imageWidth: number,
    imageHeight: number
  ) {
    this.data = data;

    this.countries = {
      osce: [],
      oecd: [],
      interpol: [],
      ilo: [],
      g7: [],
      nato: [],
      uncfcc: [],
      un: [],
      coe: [],
      eu: [],
    };

    this.datapoints_2d = {
      coe_2d: [],
      ilo_2d: [],
      interpol_2d: [],
      osce_2d: [],
      nato_2d: [],
      eu_2d: [],
      g7_2d: [],
      oecd_2d: [],
      un_2d: [],
      uncfcc_2d: [],
    };

    this.datapoints_3d = {
      coe_3d: [],
      ilo_3d: [],
      interpol_3d: [],
      osce_3d: [],
      nato_3d: [],
      eu_3d: [],
      g7_3d: [],
      oecd_3d: [],
      un_3d: [],
      uncfcc_3d: [],
    };

    this.data.forEach((country) => {
      if (country.in_eu) {
        this.countries.eu.push(country);
        this.datapoints_2d.eu_2d.push(
          this.mapTo2D(country, imageWidth, imageHeight)
        );
        this.datapoints_3d.eu_3d.push(this.mapTo3D(country, radius));
      }

      if (country.in_uncfcc) {
        this.countries.uncfcc.push(country);
        this.datapoints_2d.uncfcc_2d.push(
          this.mapTo2D(country, imageWidth, imageHeight)
        );
        this.datapoints_3d.uncfcc_3d.push(this.mapTo3D(country, radius));
      }

      if (country.in_nato) {
        this.countries.nato.push(country);
        this.datapoints_2d.nato_2d.push(
          this.mapTo2D(country, imageWidth, imageHeight)
        );
        this.datapoints_3d.nato_3d.push(this.mapTo3D(country, radius));
      }

      if (country.in_coe) {
        this.countries.coe.push(country);
        this.datapoints_2d.coe_2d.push(
          this.mapTo2D(country, imageWidth, imageHeight)
        );
        this.datapoints_3d.coe_3d.push(this.mapTo3D(country, radius));
      }

      if (country.in_g7) {
        this.countries.g7.push(country);
        this.datapoints_2d.g7_2d.push(
          this.mapTo2D(country, imageWidth, imageHeight)
        );
        this.datapoints_3d.g7_3d.push(this.mapTo3D(country, radius));
      }

      if (country.in_ilo) {
        this.countries.ilo.push(country);
        this.datapoints_2d.ilo_2d.push(
          this.mapTo2D(country, imageWidth, imageHeight)
        );
        this.datapoints_3d.ilo_3d.push(this.mapTo3D(country, radius));
      }

      if (country.in_interpol) {
        this.countries.interpol.push(country);
        this.datapoints_2d.interpol_2d.push(
          this.mapTo2D(country, imageWidth, imageHeight)
        );
        this.datapoints_3d.interpol_3d.push(this.mapTo3D(country, radius));
      }

      if (country.in_oecd) {
        this.countries.oecd.push(country);
        this.datapoints_2d.oecd_2d.push(
          this.mapTo2D(country, imageWidth, imageHeight)
        );
        this.datapoints_3d.oecd_3d.push(this.mapTo3D(country, radius));
      }

      if (country.in_un) {
        this.countries.un.push(country);
        this.datapoints_2d.un_2d.push(
          this.mapTo2D(country, imageWidth, imageHeight)
        );
        this.datapoints_3d.un_3d.push(this.mapTo3D(country, radius));
      }

      if (country.in_osce) {
        this.countries.osce.push(country);
        this.datapoints_2d.osce_2d.push(
          this.mapTo2D(country, imageWidth, imageHeight)
        );
        this.datapoints_3d.osce_3d.push(this.mapTo3D(country, radius));
      }
    });
    this.countries.org_infos = organization_infos;
  }
/**
 * Maps the coordinates of a country in to the 3d Sphere.
 * @param datapoint 
 * @param radius 
 * @returns datapoints3D
 */
  mapTo3D(datapoint: ICountryData, radius: number): I3DCountryData {
    let datapoints3D: I3DCountryData = Object.assign({}, datapoint, {
      x: 0,
      y: 0,
      z: 0,
    });
    const x = -(
      radius *
      Math.sin((90 - datapoint.latitude) * (Math.PI / 180)) *
      Math.cos((datapoint.longitude + 180) * (Math.PI / 180))
    );
    const z =
      radius *
      Math.sin((90 - datapoint.latitude) * (Math.PI / 180)) *
      Math.sin((datapoint.longitude + 180) * (Math.PI / 180));
    const y = radius * Math.cos((90 - datapoint.latitude) * (Math.PI / 180));
    datapoints3D.x = x;
    datapoints3D.y = y;
    datapoints3D.z = z;
    return datapoints3D;
  }
/**
 * Maps the coordinates of a country in the 2d map of the worlds, given the height and width of the image.
 * @param datapoint 
 * @param imageWidth 
 * @param imageHeight 
 * @returns 
 */
  mapTo2D(
    datapoint: ICountryData,
    imageWidth: number,
    imageHeight: number
  ): I2DCountryData {
    let datapoints2D: I2DCountryData = Object.assign({}, datapoint, {
      x: 0,
      y: 0,
    });
    const x = (imageWidth / 360.0) * (180 + datapoint.longitude);
    const y = (imageHeight / 180.0) * (90 - datapoint.latitude);
    datapoints2D.x = x;
    datapoints2D.y = y;
    return datapoints2D;
  }
}
