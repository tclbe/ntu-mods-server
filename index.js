const express = require("express")
const app = express()
const logger = require("morgan")
const cors = require("cors") // cross-origin resource sharing
const createError = require("http-errors")
const cookieParser = require("cookie-parser")

const ntumods = require("./routes/ntumods")

const PORT = process.env.PORT || 3000

app.use(logger("dev"))
app.use(cors({ origin: "https://ntu-mod.herokuapp.com" }))
app.use(cookieParser())

app.get("/", (req, res) => {
  res.send("up")
})

// ROUTES
app.use("/ntumods", ntumods)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get("env") === "development" ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.send(err)
})

const server = app.listen(PORT, () => {
  console.log(`Live on ${PORT}.`)
})

async function gracefulShutdown(signal) {
  console.log(`\n${signal} received.`)
  await require("mongoose").disconnect()
  console.log("Disconnected from MongoDB.")
  server.close()
  console.log("HTTP server closed.\nGraceful shutdown complete.")
  process.exit(0)
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
process.on("SIGHUP", () => gracefulShutdown("SIGHUP"))
process.on("SIGINT", () => gracefulShutdown("SIGINT"))
process.on("uncaughtException", (err) => {
  gracefulShutdown("Uncaught exception")
  console.error(err)
})
