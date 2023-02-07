import { Type } from '@mikro-orm/core'
import {
  Feature,
  Geometry, GeometryCollection,
} from 'geojson'
import { GeoJSONGeometry, stringify } from 'wellknown'
import { parseFromWK } from 'wkt-parser-helper'

export function convertGeometryToWK(geojson: Geometry): string {
  return stringify(geojson as GeoJSONGeometry)
}

export function convertFeatureToWK(geojson: Feature): string {
  return convertGeometryToWK(geojson.geometry)
}

export class PointType extends Type<GeometryCollection | undefined, string | undefined> {
  convertToDatabaseValue(value: GeometryCollection | any): string | undefined {
    if (!value)
      return value
    // if (value.type !== 'FeatureCollection')
    //   throw new Error('GeoJSON is not a FeatureCollection')

    if (value.type && value.type as any === 'FeatureCollection') {
      value = value.features
        .map((d: any) => convertFeatureToWK(d))
        .join(',')
    }
    console.log('convertToDatabaseValue', value)

    return `GEOMETRYCOLLECTION(${value})`
  }

  convertToJSValue(value: string | undefined): GeometryCollection | any {
    return parseFromWK(value as any)
  }

  convertToJSValueSQL(key: string) {
    return `ST_AsText(${key})`
  }

  convertToDatabaseValueSQL(key: string) {
    return `ST_GeomFromText(${key})`
  }

  getColumnType(): string {
    return 'geometry'
  }
}

// import Knex from 'knex'
// import { Geometry } from 'wkx'

// export class GeographyType extends Type {
//   knex = Knex({ client: 'pg' })

//   constructor(private type = 'Point') {
//     super()
//   }

//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   convertToDatabaseValue(value: any, platform: Platform): any {
//     if (value === null)
//       return value
//     value = JSON.parse(value)

//     try {
//       return this.knex.raw('ST_GeomFromGeoJSON(?)', [JSON.stringify(value)])
//     }
//     catch (e) {
//       throw ValidationError.invalidType(GeographyType, value, 'JS')
//     }

//     throw ValidationError.invalidType(GeographyType, value, 'JS')
//   }

//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   convertToJSValue(value: any, platform: Platform): any {
//     if (!value)
//       return value

//     try {
//       return Geometry.parse(Buffer.from(value, 'hex')).toGeoJSON({
//         shortCrs: true,
//       })
//     }
//     catch (e) {
//       throw ValidationError.invalidType(GeographyType, value, 'database')
//     }
//   }

//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   getColumnType(prop: EntityProperty, platform: Platform) {
//     return `GEOGRAPHY(${this.type})`
//   }
// }
