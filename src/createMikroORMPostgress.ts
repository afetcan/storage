import { join } from 'path'
import { MikroORM, PostgreSqlDriver } from '@mikro-orm/postgresql'
import { EntityCaseNamingStrategy, Highlighter, LogContext, Logger, LoggerNamespace, LoggerOptions } from '@mikro-orm/core'
import { SqlHighlighter } from '@mikro-orm/sql-highlighter'
import zod from 'zod'
import { config } from 'dotenv'
import { diary, enable, error, info } from 'diary'
import { entities } from './entity'
import { DatabaseSeeder } from './seeders/DatabaseSeeder'

enable('*')

info('Starting MikroORM')

// Maybe setup a scoped logger
const scopedDiary = diary('mikro-db', (event) => {
  if (event.level === 'error')
    console.error(event)
})

class MyLogger implements Logger {
  debugMode: boolean | LoggerNamespace[]
  usesReplicas: boolean | undefined
  highlighter: Highlighter | undefined
  writer: ((msg: string) => void) | undefined

  constructor(private readonly options: LoggerOptions) {
    this.debugMode = this.options.debugMode ?? false
    this.usesReplicas = this.options.usesReplicas
    this.highlighter = this.options.highlighter
    this.writer = this.options.writer
    this.highlighter = this.highlighter ?? new SqlHighlighter()
  }

  log(ns: LoggerNamespace, msg: string) {
    info(`${ns}: ${msg}`)
  }

  error(ns: LoggerNamespace, msg: string) {
    scopedDiary.error(`${ns}: ${msg}`)
  }

  warn(ns: LoggerNamespace, msg: string) {
    scopedDiary.warn(`${ns}: ${msg}`)
  }

  logQuery(context: LogContext) {
    if (!this.isEnabled('query'))
      return
    if (context.query) {
      /* istanbul ignore next */
      const query = this.highlighter?.highlight(context.query) ?? context.query
      const params = context.params?.length ? ` with params ${JSON.stringify(context.params)}` : ''
      const took = context.took ? ` in ${context.took} ms` : ''
      const conn = context.connection?.name ? ` on connection ${context.connection.name}` : ''
      const replica = (this.usesReplicas && context.connection?.type === 'read') ? ' [replica]' : ''
      const level = context.level ?? 'info'
      // info(level, '-', took, queryShort)
      if (level === 'error') {
        error('query', query, `${params}${took}${conn}${replica}`)
        scopedDiary.error(query)
        scopedDiary.error(params)
      }
    }
  }

  setDebugMode() {
    return true
  }

  isEnabled(namespace: LoggerNamespace): boolean {
    return !!this.debugMode && (!Array.isArray(this.debugMode) || this.debugMode.includes(namespace))
  }
}

const distPath = process.env.NODE_ENV === 'production' ? 'build' : 'src'

config()

const isNumberString = (input: unknown) => zod.string().regex(/^\d+$/).safeParse(input).success

const numberFromNumberOrNumberString = (input: unknown): number | undefined => {
  if (typeof input == 'number')
    return input
  if (isNumberString(input))
    return Number(input)
}

const NumberFromString = zod.preprocess(numberFromNumberOrNumberString, zod.number().min(1))

// treat an empty string (`''`) as undefined
const emptyString = <T extends zod.ZodType>(input: T) => {
  return zod.preprocess((value: unknown) => {
    if (value === '')
      return undefined
    return value
  }, input)
}

const PostgresModel = zod.object({
  POSTGRES_SSL: emptyString(zod.union([zod.literal('1'), zod.literal('0')]).optional()),
  POSTGRES_DROP_SCHEMA: emptyString(zod.union([zod.literal('1'), zod.literal('0')]).optional()),
  POSTGRES_HOST: zod.string(),
  POSTGRES_PORT: NumberFromString,
  POSTGRES_DB: zod.string(),
  POSTGRES_USER: zod.string(),
  POSTGRES_PASSWORD: zod.string(),
  POSTGRES_MIGRATIONS: emptyString(zod.union([zod.literal('1'), zod.literal('0')]).optional()),
  POSTGRES_SEEDS: emptyString(zod.union([zod.literal('1'), zod.literal('0')]).optional()),
  POSTGRES_SYNCHRONIZE: emptyString(zod.union([zod.literal('1'), zod.literal('0')]).optional()),
  POSTGRES_DEBUG: emptyString(zod.union([zod.literal('1'), zod.literal('0')]).optional()),
  POSTGRES_URL: emptyString(zod.string().url().optional()),
  POSTGRES_HIGHLIGHT: emptyString(zod.union([zod.literal('1'), zod.literal('0')]).optional()),
})

const configs = {

  postgres: PostgresModel.safeParse(process.env),

}

const environmentErrors: Array<string> = []

function extractConfig<Input, Output>(config: zod.SafeParseReturnType<Input, Output>): Output {
  if (!config.success)
    throw new Error('Something went wrong.')

  return config.data
}

interface Config {
  env: boolean
  host?: string
  port?: number
  db?: string
  user?: string
  password?: string
  ssl?: boolean
  dropShema?: boolean
  migrations?: boolean
  seeds?: boolean
  synchronize?: boolean
  debug?: boolean
  url?: string
  highlight?: boolean
  globalContext?: boolean
}

export async function createMikroORMPostgress(config: Config): Promise<MikroORM> {
  const data: Config = config || {} as Config
  if (config.env) {
    for (const config of Object.values(configs)) {
      if (config.success === false)
        environmentErrors.push(JSON.stringify(config.error.format(), null, 4))
    }

    if (environmentErrors.length) {
      const fullError = environmentErrors.join('\n')
      console.error('❌ Invalid environment variables:', fullError)
    }

    const postgres = extractConfig(configs.postgres)
    data.host = postgres.POSTGRES_HOST
    data.port = postgres.POSTGRES_PORT
    data.db = postgres.POSTGRES_DB
    data.user = postgres.POSTGRES_USER
    data.password = postgres.POSTGRES_PASSWORD
    data.ssl = postgres.POSTGRES_SSL === '1'
    data.dropShema = postgres.POSTGRES_DROP_SCHEMA === '1'
    data.migrations = postgres.POSTGRES_MIGRATIONS === '1'
    data.seeds = postgres.POSTGRES_SEEDS === '1'
    data.synchronize = postgres.POSTGRES_SYNCHRONIZE === '1'
    data.debug = postgres.POSTGRES_DEBUG === '1'
    data.url = postgres.POSTGRES_URL
    data.highlight = postgres.POSTGRES_HIGHLIGHT === '1'
  }
  const dbConnection = await MikroORM.init<PostgreSqlDriver>({
    clientUrl: data.url,
    debug: data.debug || undefined,
    dbName: data.db || undefined,
    loggerFactory: (options: LoggerOptions) => new MyLogger(options),
    allowGlobalContext: config?.globalContext || false,
    namingStrategy: EntityCaseNamingStrategy,
    highlighter: data.highlight ? new SqlHighlighter() : undefined,
    entities,
    entitiesTs: entities,
    forceUndefined: true,
    forceUtcTimezone: true,
    validate: true,
    driverOptions: {
      connection: { ssl: data.ssl || false },
    },
    pool: {
      min: 0,
    },
    seeder: {
      path: join(distPath, 'seeders'),
    },
    migrations: {
      path: join(distPath, 'migrations'),
      pathTs: join(distPath, 'migrations'),
    },
    // schemaGenerator: {
    //   disableForeignKeys: true, // wrap statements with `set foreign_key_checks = 0` or equivalent
    //   createForeignKeyConstraints: true, // whether to generate FK constraints
    //   ignoreSchema: [], // allows ignoring some schemas when diffing
    // },
  })

  const schemaGenerator = dbConnection.getSchemaGenerator()
  await schemaGenerator.ensureDatabase()

  if (data.dropShema) {
    await schemaGenerator.dropSchema({ schema: 'public' }).catch((error) => {
      console.error('❌ Error dropping schema:', error)
    })
    try {
      await dbConnection.em.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;')
      await dbConnection.em.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA public;')
      await dbConnection.em.execute('CREATE EXTENSION IF NOT EXISTS "postgis" SCHEMA public;')
      await schemaGenerator.createSchema({ schema: 'public' }).catch((error) => {
        console.error('❌ Error creating schema:', error)
      })
    }
    catch (error) {

    }
  }

  if (data.synchronize)
    await schemaGenerator.updateSchema({ schema: 'public' })

  if (data.migrations)
    await dbConnection.getMigrator().up()

  if (data.seeds)
    await dbConnection.getSeeder().seed(DatabaseSeeder)

  return dbConnection
}
