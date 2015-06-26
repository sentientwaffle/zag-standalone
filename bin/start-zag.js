#!/usr/bin/env node
var path         = require('path')
  , zWeb         = require('zag')
  , zDaemon      = require('zag-daemon')
  , LevelBackend = require('zag-backend-leveldb')
  , daemonHost   = "0.0.0.0:8876"
  , daemons      = [daemonHost]
  , webHost      = "0.0.0.0:8875"
  , DEFAULT_ENV  = "dev"
  , argv         = process.argv
  , args         = argv.slice(2)
  , l            = console.log

if (args.length === 0) usage()

start(args[0], args[1])

function start(db, env) {
  env = env || DEFAULT_ENV

  zDaemon(
  { host:    daemonHost
  , join:    daemons
  , db:      db
  , env:     env
  , backend: LevelBackend
  }).on("error", onError)

  zWeb(
  { host:    webHost
  , db:      db
  , env:     env
  , daemons: daemons
  , backend: LevelBackend
  // This directory needs to be readable and writable by the process.
  , public:  "/tmp/metrics-standalone-public"
  }).on("error", onError).on("ready", function() {
    console.log("zag-web listening on " + webHost)
    console.log("zag-daemon pool: " + JSON.stringify(daemons))
  })
}

function onError(err) { console.error(err) }

function usage() {
  l("Usage: " + argv[0] + " " + path.basename(argv[1]) + " <leveldb file> [env]")
  l("")
  l("Start a standalone Zag server and daemon.")
  l("The first time it is run it will create the tables and indices.")
  process.exit(1)
}
